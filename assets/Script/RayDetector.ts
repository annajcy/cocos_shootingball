import { _decorator, Component, input, Input, EventMouse, Camera, PhysicsSystem, geometry, Vec3, Node, clamp, Layers, math } from 'cc';
import { ShooterController } from './ShooterController';
import { Shoot } from './Shoot';

const { ccclass, property } = _decorator;

@ccclass('RaycastDetectorWithHitPoint')
export class RaycastDetectorWithHitPoint extends Component {
    

    @property(Node)
    touchTest: Node = null;

    @property(Node)
    origin: Node = null;

    @property(Node)
    pitch = null;

    @property(Camera)
    camera: Camera = null; // 需要指定场景中的相机

    @property(ShooterController)
    shooterController: ShooterController = null;

    @property(Shoot)
    shoot: Shoot = null;

    onLoad() {
        // 注册鼠标按下事件
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    onDestroy() {
        // 移除事件监听
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    onMouseDown(event: EventMouse) {
        if (!this.camera) {
            console.error('Camera is not assigned!');
            return;
        }

        // 获取鼠标点击位置
        const mousePos = event.getLocation();
        const ray = new geometry.Ray();

        // 从相机生成射线
        this.camera.screenPointToRay(mousePos.x, mousePos.y, ray);

        // 使用物理系统进行射线检测
        if (PhysicsSystem.instance.raycast(ray)) {
            const results = PhysicsSystem.instance.raycastResults;
            if (results.length > 0) {
                results.forEach(hit => {
                    if (hit.collider.node.name == "TouchTest")
                    {
                        console.log(hit.collider.node.name);
                        this.handleHitPoint(hit.hitPoint);
                    }
                    
                });
                
            } else {
                console.log('No objects hit.');
            }
        } else {
            console.log('Raycast did not hit any objects.');
        }
    }

    public getYawAndPitchRotation(a: Vec3, b: Vec3): { yaw: number; pitch: number } {
        // 归一化输入向量
        const normalizedA = a.normalize();
        const normalizedB = b.normalize();

        // 忽略 Y 轴分量计算水平向量
        const aHorizontal = new Vec3(normalizedA.x, 0, normalizedA.z).normalize();
        const bHorizontal = new Vec3(normalizedB.x, 0, normalizedB.z).normalize();

        // 计算 Yaw（偏航角）：绕 Y 轴旋转
        let yaw = Math.atan2(bHorizontal.z, bHorizontal.x) - Math.atan2(aHorizontal.z, aHorizontal.x);

        // 计算 Pitch（俯仰角）：垂直方向，考虑 Y 分量
        const pitch = Math.asin(clamp(normalizedB.y, -1, 1)) - Math.asin(clamp(normalizedA.y, -1, 1));

        // 将弧度转换为角度
        yaw = math.toDegree(yaw);
        const pitchDeg = math.toDegree(pitch);

        // 确保 Yaw 在 [-180, 180) 范围内
        if (yaw >= 180) yaw -= 360;
        if (yaw < -180) yaw += 360;

        return { yaw, pitch: pitchDeg };
    }

    getFaceDirection(node: Node): Vec3 {
        const worldRotation = node.worldRotation; // 获取节点的世界旋转
        const up = new Vec3(0, 1, 0);             // 定义局部 Y 轴方向向量
        const result = new Vec3();
    
        // 将局部 Y 轴方向旋转到世界空间
        Vec3.transformQuat(result, up, worldRotation);
    
        return result; // 返回世界空间下的 Y 轴方向
    }

    handleHitPoint(hitPoint: Vec3) {
        console.log('Handling hit point:', hitPoint);
        let targetDirection : Vec3 = hitPoint.subtract(this.origin.worldPosition).normalize();
        let faceDirection : Vec3 = this.getFaceDirection(this.pitch).normalize();

        console.log(targetDirection.toString() + " " + faceDirection.toString());

        const { yaw, pitch } = this.getYawAndPitchRotation(targetDirection, faceDirection);
        console.log(yaw.toString() + ", " + pitch.toString());

        this.shooterController.adjustPitch(pitch);
        this.shooterController.adjustYaw(yaw);

        this.touchTest.active = false;
        this.shoot.shoot();
    }
}