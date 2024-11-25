import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PositionFollower')
export class PositionFollower extends Component {
    // 跟随目标
    @property(Node)
    targetNode: Node = null;

    private tempPosition: Vec3 = new Vec3(); // 临时变量，用于存储目标位置

    update(deltaTime: number) {
        if (this.targetNode) {
            // 获取目标节点的世界位置并应用到当前节点
            this.targetNode.getWorldPosition(this.tempPosition);
            this.node.setWorldPosition(this.tempPosition);
        }
    }
}