import { Op } from "sequelize";
import { Comment } from "../scopes/index.js";
const findAllCommentsQuery = async () => {
    const comments = await Comment.scope("withAssociations").findAll();
    return comments;
};
const findAllCommentsBySearchQuery = async ({ query }) => {
    const queries = query
        .trim()
        .split(" ")
        .filter((q) => q !== "")
        .map((q) => ({ name: { [Op.like]: `%${q}%` } }));

    const comment = await Comment.scope("withAssociations").findAll({
        where: {
            [Op.or]: [...queries],
        },
    });
    return comment;
};
const findByPkCommentQuery = async (id) => {
    const comment = await Comment.scope("withAssociations").findByPk(id);
    return comment;
};
const findOneCommentQuery = async (where) => {
    const comment = await Comment.scope("withAssociations").findOne({ where });
    return comment;
};

const createCommentQuery = async (commentData) => {
    const createdComment = await Comment.create(commentData);
    return createdComment;
};

const updateCommentQuery = async (commentData, where) => {
    await Comment.update(commentData, { where });
    const updatedComment = await Comment.scope("withAssociations").findOne({
        where,
    });
    return updatedComment;
};

const deleteCommentQuery = async (where) => {
    const deletedComment = await Comment.destroy({
        where,
    });
    return deletedComment;
};

export {
    findAllCommentsQuery,
    findAllCommentsBySearchQuery,
    findByPkCommentQuery,
    findOneCommentQuery,
    createCommentQuery,
    updateCommentQuery,
    deleteCommentQuery,
};
