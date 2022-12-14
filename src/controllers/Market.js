import { Op } from "sequelize"
import { marketsQueries } from "../queries/index.js"
import { MarketValidation } from "../validation/index.js"

export default {
    getById: async (req, res) => {
        const id = parseInt(req.params.id)
        const data = await marketsQueries.findOneQuery({ where: { id } }, [
            "withAssociations",
        ])
        if (data) {
            res.status(200).json(data)
        } else {
            res.status(404).json({
                message: `Record not found with ID: ${id}`,
            })
        }
    },
    getByName: async (req, res) => {
        const name = req.params.name
        const record = await marketsQueries.findOneQuery({ where: { name } }, [
            "withAssociations",
        ])
        if (record) {
            res.status(200).json(record)
        } else {
            res.status(404).json({
                message: `Record not found with Slug: ${name}`,
            })
        }
    },

    getAll: async (req, res) => {
        const { page, size } = req.query
        const params = {
            page: parseInt(page),
            size: parseInt(size),
        }
        const data = await marketsQueries.findAllQuery(
            {},
            ["withAssociations"],
            params
        )
        if (data) {
            res.status(200).json(data)
        } else {
            res.status(404).json({ message: `Records not found` })
        }
    },
    getAllBySearch: async (req, res) => {
        const query = req.params.query
        const queries = query
            .trim()
            .split(" ")
            .filter((q) => q !== "")
            .map((q) => ({ title: { [Op.like]: `%${q}%` } }))
        const rows = await marketsQueries.findAllQuery(
            {
                where: {
                    [Op.or]: [...queries],
                },
            },
            ["withAssociations"]
        )
        if (rows) {
            return res.status(200).json(rows)
        } else {
            return res
                .status(404)
                .json({ message: `Record not found with Query: ${query}` })
        }
    },

    create: async (req, res) => {
        const { session, user } = req

        const { name, username, title, description, about, CategoriesIds } =
            req.body
        const marketData = {
            name,
            username,
            title,
            description,
            about,
            UserId: user.id,
            CategoriesIds: CategoriesIds.map((id) => parseInt(id)),
        }

        const isMarketValid = MarketValidation.validateCreate(marketData)

        if (!isMarketValid.valid) {
            return res.status(400).json({
                message: "Invalid market data",
                errors: isMarketValid.errors,
            })
        }

        const createdMarket = await marketsQueries.create(marketData)

        if (createdMarket) {
            return res.status(201).json(createdMarket)
        } else {
            return res.status(500).json({ message: `Faile to create a market` })
        }
    },
    update: async (req, res) => {
        const id = parseInt(req.params.id)
        const { session, user } = req

        const { name, username, about, title, description, CategoriesIds } =
            req.body

        const marketData = {
            name,
            username,
            title,
            description,
            about,
            CategoriesIds,
            UserId: user.id,
        }

        const isMarketValid = MarketValidation.validateUpdateMarket(marketData)

        if (!isMarketValid) {
            res.status(400).json({ message: "Market not updated" })
        }

        const updatedMarket = await marketsQueries.create(marketData, { id })

        if (updatedMarket) {
            res.status(200).json({
                message: `Market updated with ID: ${updatedMarket[0]?.id}`,
                data: updatedMarket,
            })
        } else {
            res.status(500).json({
                message: `Faile to update a market, ${id}`,
            })
        }
    },
    remove: async (req, res) => {
        const id = parseInt(req.params.id)
        const recordDeleted = await marketsQueries.remove({ id })
        res.status(200).json(recordDeleted)
    },
}
