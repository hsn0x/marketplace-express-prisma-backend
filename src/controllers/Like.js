import { LikeMiddleware } from "../middleware/index.js"
import Product from "../models/Product.js"
import { likesQueries, productsQueries } from "../queries/index.js"
import { LikeValidation } from "../validation/index.js"

export default {
    getAll: async (req, res) => {
        const likes = await likes.findAllQuery({}, ["withAssociations"], {
            page,
            size,
        })
        if (likes) {
            res.status(200).json({ likes })
        } else {
            res.status(404).json({ message: `Likes not found` })
        }
    },
    getById: async (req, res) => {
        const id = parseInt(req.params.id)
        const like = await likes.findOneQuery({ where: { id } })
        if (like) {
            res.status(200).json({ like })
        } else {
            res.status(404).json({ message: `Like not found with ID: ${id}` })
        }
    },

    create: async (req, res, next) => {
        const { session, user } = req

        const { ProductId } = req.body
        const likeData = {
            UserId: user.id,
            ProductId,
        }

        // const isValid = LikeValidation.validateCreate(likeData);

        // if (!isValid.valid) {
        //     return res.status(400).json({
        //         message: "Invalid like data",
        //         errors: isValid.errors,
        //     });
        // }
        // const product = await likes.findByPkQuery(likeData.ProductId);

        const createdLike = await likes.createQuery(likeData)

        if (createdLike) {
            return res.status(201).json({
                message: `Like created with ID: ${createdLike.id}`,
                createdLike,
            })
        } else {
            return res.status(500).json({ message: `Faile to create a like` })
        }
    },
    update: async (req, res, next) => {
        const isExist = await likes.isExist(req, res, next)
        if (!isExist) {
            await likes.create(req, res)
        } else {
            await likes.remove(req, res)
        }
    },
    remove: async (req, res) => {
        const id = parseInt(req.params.id)
        await likes.deleteQuery({ id })
        return res.status(200).json({ message: `Like deleted with ID: ${id}` })
    },
}
