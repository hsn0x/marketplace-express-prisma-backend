import { Resource } from "../models/index.js"
import { RESOURCES_CONSTANTS } from "../constants/index.js"
import { resourcesQueries, permissionsQueries } from "../queries/index.js"

export const createAll = async () => {
    await Resource.bulkCreate(RESOURCES_CONSTANTS)
    const permissions = await permissionsQueries.findAllQuery({}, [
        "withAssociations",
    ])
    for (
        let permissionIndex = 0;
        permissionIndex < permissions.length;
        permissionIndex++
    ) {
        const permission = permissions[permissionIndex]
        const resources = await resourcesQueries.findAllQuery(
            {},
            ["withAssociations"],
            params
        )
        for (
            let resourceIndex = 0;
            resourceIndex < resources.length;
            resourceIndex++
        ) {
            const resource = resources[resourceIndex]
            await permission.addResource(resource.id)
        }
    }
}
