import { Post } from "../types";
import { api } from "./api";

export const postsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createPost: builder.mutation<Post, { content: string }>({
            query: (postData) => ({
                url: "/posts",
                method: "POST",
                body: postData,
            }),
            invalidatesTags: ["Post"],
        }),
        getAllPosts: builder.query<Post[], void>({
            query: () => ({
                url: "/posts",
                method: "GET"
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "Post" as const, id })),
                          { type: "Post", id: "LIST" },
                      ]
                    : [{ type: "Post", id: "LIST" }],
        }),
        getPostById: builder.query<Post, string>({
            query: (id) => ({
                url: `/posts/${id}`,
                method: "GET"
            }),
            providesTags: (result, error, id) => [{ type: "Post", id }],
        }),
        deletePost: builder.mutation<void, string>({
            query: (id) => ({
                url: `/posts/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: (result, error, id) => [{ type: "Post", id }],
        }),
    }),
});

export const {
    useCreatePostMutation,
    useGetAllPostsQuery,
    useGetPostByIdQuery,
    useDeletePostMutation,
    useLazyGetAllPostsQuery,
    useLazyGetPostByIdQuery
} = postsApi

export const {
    endpoints: {
        createPost,
        getAllPosts,
        getPostById,
        deletePost,
    }
} = postsApi