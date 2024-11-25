import { _decorator, Component, Node, Vec3, math, input, Input, EventKeyboard, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShooterController')
export class ShooterController extends Component {
    @property(Node)
    yawNode: Node = null; // 控制水平旋转的节点

    @property(Node)
    pitchNode: Node = null; // 控制俯仰的节点

    @property
    minPitch: number = -30; // 最小俯仰角（上下限制）

    @property
    maxPitch: number = 60; // 最大俯仰角

    @property
    yawSpeed: number = 1; // 水平旋转速度（度/秒）

    @property
    pitchSpeed: number = 1; // 俯仰速度（度/秒）

    private currentYaw: number = 0; // 当前水平旋转角
    private currentPitch: number = 0; // 当前俯仰角

    onLoad() {
        // 监听键盘输入
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    protected start(): void {
        // 初始化节点旋转
        if (this.yawNode) this.currentYaw = this.yawNode.eulerAngles.y;
        if (this.pitchNode) this.currentPitch = this.pitchNode.eulerAngles.z;
    }

    onDestroy() {
        // 移除监听
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            // 控制水平旋转
            case KeyCode.KEY_D:
                this.adjustYaw(-this.yawSpeed);
                break;
            case KeyCode.KEY_A:
                this.adjustYaw(this.yawSpeed);
                break;

            // 控制俯仰
            case KeyCode.KEY_W:
                this.adjustPitch(this.pitchSpeed);
                break;
            case KeyCode.KEY_S:
                this.adjustPitch(-this.pitchSpeed);
                break;
        }
    }

    adjustYaw(delta: number) {
        // 更新水平旋转角
        this.currentYaw += delta;
        if (this.yawNode) {
            this.yawNode.setRotationFromEuler(0, this.currentYaw, 0);
        }
    }

    adjustPitch(delta: number) {
        // 更新俯仰角，并限制范围
        this.currentPitch += delta;
        if (this.pitchNode) {
            this.pitchNode.setRotationFromEuler(0, 0, this.currentPitch);
        }
    }
}