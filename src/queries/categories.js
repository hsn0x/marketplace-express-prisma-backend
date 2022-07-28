import { Op } from "sequelize"
import { CategoryScope } from "../scopes/index.js"
import { getPagination, getPagingData } from "../lib/handlePagination.js"

export default {
    findAllQuery: async (filter, scope, params) => {
        const { limit, offset } = getPagination(params.page, params.size)

        const rows = await CategoryScope.scope(scope).findAll({
            limit,
            offset,
            filter,
        })
        const count = await CategoryScope.count()
        const { totalItems, totalPages, currentPage } = getPagingData(
            count,
            page,
            limit
        )
        return {
            totalItems,
            totalPages,
            currentPage,
            count,
            rows,
        }
    },
    findByPkQuery: async (id, scope) => {
        const record = await CategoryScope.scope(scope).findByPk(id)
        return record
    },
    findOneQuery: async (filter, scope) => {
        const record = await CategoryScope.scope(scope).findOne(filter)
        return record
    },

    create: async (data) => {
        const recordCreated = await CategoryScope.create(data)
        console.log(recordCreated.id)
        data.CategoriesIds.map(
            async (ci) => await recordCreated.addCategory(ci)
        )
        return recordCreated
    },

    update: async (data, where) => {
        await CategoryScope.update(data, { where })
        const recordUpdated = await CategoryScope.scope(scope).findOne(filter)
        recordUpdated.categories.map(
            async (c) => await recordUpdated.removeCategory(c.id)
        )
        data.CategoriesIds.map(
            async (ci) => await recordUpdated.addCategory(ci)
        )

        return recordUpdated
    },

    remove: async (filter, scope) => {
        const recordDeleted = await CategoryScope.destroy(filter)

        return recordDeleted
    },
}
