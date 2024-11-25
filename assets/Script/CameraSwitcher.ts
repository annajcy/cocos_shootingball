import { _decorator, Component, Node, Vec3, tween, input, Input, EventKeyboard, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraSwitcher')
export class CameraSwitcher extends Component {
    @property(Node)
    cameraNode: Node = null;

    @property([Node])
    cameraPositions: Node[] = [];

    private currentIndex: number = 0;

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
        }
    }

    switchToNextPosition() {
        this.currentIndex = (this.currentIndex + 1) % this.cameraPositions.length;
        const targetNode = this.cameraPositions[this.currentIndex];
        this.moveCameraTo(targetNode.position);
        this.rotateCameraTo(targetNode.eulerAngles);
    }

    switchToPreviousPosition() {
        this.currentIndex = (this.currentIndex - 1 + this.cameraPositions.length) % this.cameraPositions.length;
        const targetNode = this.cameraPositions[this.currentIndex];
        this.moveCameraTo(targetNode.position);
        this.rotateCameraTo(targetNode.eulerAngles);
    }

    moveCameraTo(targetPosition: Vec3) {
        if (this.cameraNode) {
            this.cameraNode.setPosition(targetPosition);
        }
    }

    rotateCameraTo(targetRotation: Vec3) {
        if (this.cameraNode) {
            this.cameraNode.setRotationFromEuler(targetRotation);
        }
    }
}