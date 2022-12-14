import { Op } from "sequelize"
import { getPagingData } from "../lib/handlePagination.js"
import { productsQueries } from "../queries/index.js"
import { ProductValidation } from "../validation/index.js"

export default {
    getById: async (req, res) => {
        const id = parseInt(req.params.id)
        const data = await productsQueries.findOneQuery({ where: { id } }, [
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
    getBySlug: async (req, res) => {
        const slug = req.params.slug
        const record = await productsQueries.findOneQuery({ where: { slug } }, [
            "withAssociations",
        ])
        if (record) {
            res.status(200).json(record)
        } else {
            res.status(404).json({
                message: `Record not found with Slug: ${slug}`,
            })
        }
    },

    getAll: async (req, res) => {
        const { page, size } = req.query
        const params = {
            page: parseInt(page),
            size: parseInt(size),
        }
        const data = await productsQueries.findAllQuery(
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
        const rows = await productsQueries.findAllQuery(
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
    getAllByFilters: async (req, res) => {
        const query = req.params.query
        const filters = {}
        filters.minPrice = Number(req.query.minPrice)
        filters.maxPrice = Number(req.query.maxPrice)
        filters.CategoriesIds = req.query.CategoriesIds?.map((ci) => Number(ci))

        const queries = query
            .trim()
            .split(" ")
            .filter((q) => q !== "")
            .map((q) => ({ title: { [Op.like]: `%${q}%` } }))

        console.log(query, filters)
        const queryFilter = {
            [Op.or]: [...queries],
        }
        const priceFilter = {
            [Op.and]: [],
        }
        if (filters.minPrice) {
            priceFilter[Op.and].push({ price: { [Op.gte]: filters.minPrice } })
        }
        if (filters.maxPrice) {
            priceFilter[Op.and].push({ price: { [Op.lte]: filters.maxPrice } })
        }

        const categoryFilter = []
        if (filters.CategoriesIds) {
            categoryFilter.push({
                model: Category,
                where: {
                    id: filters.CategoriesIds,
                },
            })
        }

        const rows = await productsQueries.findAll(
            {
                where: {
                    [Op.and]: [{ ...queryFilter }, { ...priceFilter }],
                },
                include: [...categoryFilter],
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

    create: async (req, res, next) => {
        const { session, user } = req

        const { title, description, price, quantity, MarketId, CategoriesIds } =
            req.body
        const data = {
            title,
            description,
            price: Number(price),
            quantity: Number(quantity),
            MarketId: Number(MarketId),
            CategoriesIds: CategoriesIds.map((ci) => Number(ci)),
            UserId: user.id,
        }

        const isValid = ProductValidation.validateCreate(data)

        if (!isValid.valid) {
            return res.status(400).json({
                message: "Invalid record data",
                errors: isValid.errors,
            })
        }

        const recordCreated = await productsQueries.create(data)

        if (recordCreated) {
            return res.status(201).json(recordCreated)
        } else {
            return res.status(500).json({ message: `Faile to create a record` })
        }
    },
    update: async (req, res) => {
        const id = parseInt(req.params.id)
        const { session, user } = req

        const { title, description, price, quantity, MarketId, CategoriesIds } =
            req.body
        const data = {
            title,
            description,
            price,
            quantity,
            MarketId,
            CategoriesIds,
            UserId: user.id,
        }

        const isValid = ProductValidation.update(data)

        if (!isValid.valid) {
            return res.status(400).json({
                message: "Invalid record data",
                errors: isValid.errors,
            })
        }

        const recordUpdated = await productsQueries.update(data, { id })

        if (recordUpdated) {
            return res.status(200).json(recordUpdated)
        } else {
            return res.status(500).json({ message: `Faile to update a record` })
        }
    },
    remove: async (req, res) => {
        const id = parseInt(req.params.id)
        const recordDeleted = await productsQueries.remove({ id })
        res.status(200).json(recordDeleted)
    },
}
