import { _decorator, Component, Node, Vec3, tween, input, Input, EventKeyboard, KeyCode, Quat } from 'cc';
const { ccclass, property } = _decorator;

export enum CameraMode {
    FOLLOW = 'follow', // 跟随模式
    FIXED = 'fixed',   // 定点模式
}

@ccclass('CameraSwitcher')
export class CameraSwitcher extends Component {
    @property(Node)
    cameraNode: Node = null; // 摄像机节点

    @property([Node])
    cameraPositions: Node[] = []; // 摄像机的预设位置

    @property(Node)
    followTarget: Node = null; // 跟随目标节点

    @property
    offset: Vec3 = new Vec3(0, 5, -10); // 摄像机相对目标的偏移量

    @property
    transitionDuration: number = 1.0; // 视角切换的平滑时间

    @property
    followSmoothness: number = 0.1; // 跟随运镜的平滑系数（0~1，值越小越平滑）

    private currentMode: CameraMode = CameraMode.FIXED; // 当前模式，默认为定点模式

    private currentIndex: number = 0; // 当前摄像机位置索引

    private tempVec: Vec3 = new Vec3(); // 临时向量用于计算平滑过渡

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ARROW_RIGHT) {
            this.switchToNextPosition();
        } else if (event.keyCode === KeyCode.ARROW_LEFT) {
            this.switchToPreviousPosition();
        } else if (event.keyCode === KeyCode.KEY_F) {
            this.setMode(CameraMode.FOLLOW); // 切换到跟随模式
        } else if (event.keyCode === KeyCode.KEY_M) {
            this.setMode(CameraMode.FIXED); // 切换到定点模式
        }
    }

    /**
     * 设置摄像机模式
     * @param mode 跟随模式或定点模式
     */
    public setMode(mode: CameraMode) {
        this.currentMode = mode;
        console.log(`Camera mode switched to: ${mode}`);
    }

    /**
     * 切换到指定摄像机位置
     * @param positionIndex 目标位置索引
     */
    public switchPosition(positionIndex: number) {
        if (positionIndex < 0 || positionIndex >= this.cameraPositions.length) {
            console.warn('Invalid camera position index:', positionIndex);
            return;
        }
        this.currentIndex = positionIndex;
        const targetNode = this.cameraPositions[this.currentIndex];
        this.moveCameraTo(targetNode.position);
        this.rotateCameraTo(targetNode.eulerAngles);
    }

    switchToNextPosition() {
        if (this.currentMode === CameraMode.FIXED) {
            this.currentIndex = (this.currentIndex + 1) % this.cameraPositions.length;
            const targetNode = this.cameraPositions[this.currentIndex];
            this.moveCameraTo(targetNode.position);
            this.rotateCameraTo(targetNode.eulerAngles);
        }
    }

    switchToPreviousPosition() {
        if (this.currentMode === CameraMode.FIXED) {
            this.currentIndex = (this.currentIndex - 1 + this.cameraPositions.length) % this.cameraPositions.length;
            const targetNode = this.cameraPositions[this.currentIndex];
            this.moveCameraTo(targetNode.position);
            this.rotateCameraTo(targetNode.eulerAngles);
        }
    }

    /**
     * 平滑移动摄像机到目标位置
     * @param targetPosition 目标位置
     */
    moveCameraTo(targetPosition: Vec3) {
        if (this.cameraNode) {
            const currentPosition = this.cameraNode.position.clone();
            tween(currentPosition)
                .to(this.transitionDuration, targetPosition, {
                    onUpdate: (value) => {
                        this.cameraNode.setPosition(value);
                    },
                })
                .start();
        }
    }

    /**
     * 平滑旋转摄像机到目标角度
     * @param targetRotation 目标欧拉角
     */
    rotateCameraTo(targetRotation: Vec3) {
        if (this.cameraNode) {
            const currentRotation = this.cameraNode.rotation.clone();
            const targetQuat = new Quat();
            Quat.fromEuler(targetQuat, targetRotation.x, targetRotation.y, targetRotation.z);

            tween(currentRotation)
                .to(this.transitionDuration, targetQuat, {
                    onUpdate: (value) => {
                        this.cameraNode.setRotation(value);
                    },
                })
                .start();
        }
    }

    /**
     * 摄像机跟随运镜
     */
    followTargetSmoothly() {
        if (this.currentMode === CameraMode.FOLLOW && this.followTarget && this.cameraNode) {
            // 计算目标世界位置 + 偏移量
            const targetPosition = new Vec3();
            Vec3.add(targetPosition, this.followTarget.worldPosition, this.offset);

            // 平滑计算摄像机到目标位置的过渡
            const currentPos = this.cameraNode.position;
            Vec3.lerp(this.tempVec, currentPos, targetPosition, this.followSmoothness);
            this.cameraNode.setPosition(this.tempVec);

            // //可选：使摄像机朝向目标
            // const lookDirection = new Vec3();
            // Vec3.subtract(lookDirection, this.followTarget.worldPosition, this.cameraNode.worldPosition);
            // Vec3.normalize(lookDirection, lookDirection);

            // const targetRotation = new Quat();
            // Quat.fromViewUp(targetRotation, lookDirection, Vec3.UP);

            // this.cameraNode.setRotation(targetRotation);
        }
    }

    update(deltaTime: number) {
        this.followTargetSmoothly();
    }
}