import Like from "../models/Like.js"
import Product from "../models/Product.js"
import { likesQueries } from "../queries/index.js"

export default {
    isExist: async (req, res, next) => {
        const { session, user } = req
        const { ProductId } = req.body

        if (!ProductId) {
            return res.status(400).json({ message: "Product ID is Required" })
        }

        const isExist = await Like.findOne({
            where: {
                UserId: user.id,
            },
            include: [
                {
                    model: Product,
                    where: {
                        id: ProductId,
                    },
                },
            ],
        })

        if (isExist) {
            return res.status(401).json({
                message: `You already liked this product`,
            })
        } else {
            return next()
        }
    },

    isOwner: async (req, res, next) => {
        const id = parseInt(req.params.id)
        const { session, user } = req

        const isOwner = await findOneQuery({ where: { id, userId: user.id } })

        if (isOwner) {
            return next()
        } else {
            return res.status(401).json({
                message: `You are not the owner of the like`,
            })
        }
    },
}
