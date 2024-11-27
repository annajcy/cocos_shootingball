import { _decorator, Component, Node, Vec3, instantiate, Prefab } from 'cc';
import { PositionFollower } from './PositionFollower';
import { CameraSwitcher, CameraMode } from './CameraSwitcher';
const { ccclass, property } = _decorator;

@ccclass('Shoot')
export class Shoot extends Component {

    @property(Node)
    touchTest : Node;

    @property(CameraSwitcher)
    cameraSwitcher: CameraSwitcher;

    @property({ type: Prefab })
    bulletPrefab: Prefab = null; // 子弹的预制体

    @property(Node)
    spawnPosition: Node = null; // 子弹生成位置

    @property(Node)
    pitch: Node = null; // 控制俯仰角的节点

    @property
    force: number = 1000; // 发射初速度

    @property
    bulletLifetime: number = 5; // 子弹存活时间

    private activeBullets: { bullet: Node; velocity: Vec3 }[] = []; // 活跃子弹的列表

    getFaceDirection(): Vec3 {
        const worldRotation = this.pitch.worldRotation; // 获取节点的世界旋转
        const forward = new Vec3(0, 1, 0); // 定义局部 Y 轴方向向量
        const result = new Vec3();

        // 将局部 Y 轴方向旋转到世界空间
        Vec3.transformQuat(result, forward, worldRotation);
        return result.normalize(); // 返回世界空间下的 Y 轴方向（归一化）
    }

    shoot() {
        if (!this.bulletPrefab || !this.spawnPosition) return;

        // 实例化子弹
        const bullet = instantiate(this.bulletPrefab);
        
        bullet.setParent(this.node.scene); // 将子弹添加到场景中
        bullet.setWorldPosition(this.spawnPosition.worldPosition); // 设置生成位置
        this.cameraSwitcher.followTarget = bullet;
        this.cameraSwitcher.setMode(CameraMode.FOLLOW);
        
        // 计算子弹初速度
        const direction = this.getFaceDirection();
        const velocity = new Vec3();
        Vec3.multiplyScalar(velocity, direction, this.force * 0.01); // 根据方向和速度倍率计算初速度

        // 将子弹添加到活跃子弹列表
        this.activeBullets.push({ bullet, velocity });

        // 设置子弹生命周期
        this.scheduleOnce(() => {
            bullet.destroy(); // 子弹存活一定时间后销毁
            this.activeBullets = this.activeBullets.filter(b => b.bullet !== bullet); // 从活跃列表中移除
            this.cameraSwitcher.setMode(CameraMode.FIXED);
            this.cameraSwitcher.switchPosition(0);
            this.touchTest.active = true;
        }, this.bulletLifetime);

    
        this.scheduleOnce(() => {
            this.cameraSwitcher.setMode(CameraMode.FIXED);
            this.cameraSwitcher.switchPosition(1);
        }, 0.4);
    }

    update(deltaTime: number) {
        // 更新活跃子弹的位置
        this.activeBullets.forEach(bulletData => {
            const { bullet, velocity } = bulletData;

            // 计算新的位置
            const currentPosition = bullet.worldPosition;
            const newPosition = new Vec3();
            Vec3.scaleAndAdd(newPosition, currentPosition, velocity, deltaTime);

            // 更新子弹的位置
            bullet.setWorldPosition(newPosition);
        });
    }
}