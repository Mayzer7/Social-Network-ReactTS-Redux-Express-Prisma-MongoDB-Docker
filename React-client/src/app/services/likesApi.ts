import { Like } from "../types"
import { api } from "./api"

export const likesApi = api.injectEndpoints({
    endpoints: builder => ({
        likePost: builder.mutation<Like, { postId: string }>({
            query: body => ({
                url: "/likes",
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, arg) => [
                { type: "Post", id: arg.postId },
                { type: "Post", id: "LIST" },
            ],
        }),
        unlikePost: builder.mutation<void, string>({
            query: postId => ({
                url: `/likes/${postId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, postId) => [
                { type: "Post", id: postId },
                { type: "Post", id: "LIST" },
            ],
        }),
    }),
})

export const { 
    useLikePostMutation, 
    useUnlikePostMutation 
} = likesApi

export const {
    endpoints: { 
        likePost, 
        unlikePost 
    },
} = likesApi
