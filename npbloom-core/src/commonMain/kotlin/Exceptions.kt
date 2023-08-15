import content.Id

abstract class NoSuchEntityException(entityType: String, entityId: Id) :
    Exception("$entityType with ID $entityId not found")

class NoSuchNodeException(nodeId: Id) : NoSuchEntityException("node", nodeId)

class NoSuchTreeException(treeId: Id) : NoSuchEntityException("tree", treeId)
