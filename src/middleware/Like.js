import Like from "../models/Like.js"
import Product from "../models/Product.js"
import { findOneQuery } from "../queries/likes.js"

const isLikeExist = async (req, res, next) => {
    const { session, user } = req
    const { ProductId } = req.body

    if (!ProductId) {
        return res.status(400).json({ message: "Product ID is Required" })
    }

    const isLikeExist = await Like.findOne({
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

    if (isLikeExist) {
        return res.status(401).json({
            message: `You already liked this product`,
        })
    } else {
        return next()
    }
}

const isLikeOwner = async (req, res, next) => {
    const id = parseInt(req.params.id)
    const { session, user } = req

    const isLikeOwner = await findOneQuery({ id, userId: user.id })

    if (isLikeOwner) {
        return next()
    } else {
        return res.status(401).json({
            message: `You are not the owner of the like`,
        })
    }
}

export { isLikeExist, isLikeOwner }
