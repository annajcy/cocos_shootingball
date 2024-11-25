import { _decorator, Component, input, Input, EventMouse, Camera, PhysicsSystem, geometry, Vec3, Node, clamp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RaycastDetectorWithHitPoint')
export class RaycastDetectorWithHitPoint extends Component {
    @property(Node)
    origin: Node = null;

    @property(Node)
    pitchDirection = null;

    @property(Camera)
    camera: Camera = null; // 需要指定场景中的相机

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
                const hit = results[0]; // 获取第一个碰撞物体
                const hitPoint = hit.hitPoint; // 获取碰撞点
                console.log('Hit object:', hit.collider.node.name);
                console.log('Hit point:', hitPoint);

                // 可选：处理碰撞点逻辑
                this.handleHitPoint(hitPoint);
            } else {
                console.log('No objects hit.');
            }
        } else {
            console.log('Raycast did not hit any objects.');
        }
    }

    public static getYawAndPitchRotation(a: Vec3, b: Vec3): { yaw: number; pitch: number } {
        // 归一化输入向量
        const normalizedA = Vec3.normalize(new Vec3(), a);
        const normalizedB = Vec3.normalize(new Vec3(), b);

        // 忽略 Y 轴分量计算水平向量
        const aHorizontal = new Vec3(normalizedA.x, 0, normalizedA.z);
        const bHorizontal = new Vec3(normalizedB.x, 0, normalizedB.z);

        Vec3.normalize(aHorizontal, aHorizontal);
        Vec3.normalize(bHorizontal, bHorizontal);

        // 计算 Yaw（偏航角）：绕 Y 轴旋转
        let yaw = Math.atan2(bHorizontal.z, bHorizontal.x) - Math.atan2(aHorizontal.z, aHorizontal.x);

        // 计算 Pitch（俯仰角）：垂直方向，考虑 Y 分量
        const pitch = Math.asin(clamp(normalizedB.y, -1, 1)) - Math.asin(clamp(normalizedA.y, -1, 1));

        // 将弧度转换为角度
        yaw = yaw * (180 / Math.PI);
        const pitchDeg = pitch * (180 / Math.PI);

        // 确保 Yaw 在 [-180, 180) 范围内
        if (yaw >= 180) yaw -= 360;
        if (yaw < -180) yaw += 360;

        return { yaw, pitch: pitchDeg };
    }

    handleHitPoint(hitPoint: Vec3) {
        // 自定义处理碰撞点的方法，例如在场景中标记或显示碰撞位置
        console.log('Handling hit point:', hitPoint);
        let targetDirection : Vec3 = hitPoint.subtract(this.origin.position).normalize();
        let faceDirection : Vec3 = this.pitchDirection.position;
        
    }
}