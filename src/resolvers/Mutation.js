import bcrypt from 'bcryptjs';

import getUserId from '../utils/getUserId';
import getToken from '../utils/createToken';
import getHashPassword from '../utils/hashPassword';

const Mutation = {
    async createUser(parent, { data }, { prisma }, info) {

        const password = await getHashPassword(data.password);
        const user = await prisma.mutation.createUser({ 
            data: {
               ...data, 
               password
            } 
        });
        
        return {
            user,
            token: getToken(user.id)
        };

     },
     async updateUser(parent, { data }, { prisma, request }, info) {
        
        const id = getUserId(request);

        if(typeof data.password === 'string') {
            data.password = await getHashPassword(data.password);
        }

        const userExist = await prisma.exists.User({ id });
        if(!userExist) throw new Error('The does not exist.');
        
        return await prisma.mutation.updateUser({
            where: { id },
            data
        }, info);
     },
     async deleteUser(parent, args, { prisma, request }, info) {

        const id = getUserId(request);
        
        const userExist = await prisma.exists.User({ id });
        if(!userExist) throw new Error ('The ID does not exist.');

        return await prisma.mutation.deleteUser({ where: { id }}, info);
        
     },
     async createPost(parent, { data: { title, body, published } }, { prisma, request }, info) {
        
        const userId = getUserId(request);
        
        return await prisma.mutation.createPost({
            data: {
                title,
                body,
                published,
                author: {
                    connect: {
                        id: userId
                    }
                }
            }
        }, info);
     },
     async updatePost(parent, { id, data: { title, body, published }}, { prisma, request }, info) {

        const userId = getUserId(request);
        const verifiedUser = await prisma.exists.Post({
            id,
            author: { id: userId }
        });

        const postPublished = await prisma.exists.Post({
            id,
            published: true
         });

         if(postPublished && published === false) {
            await prisma.mutation.deleteManyComments({
                where: {
                    post: {
                        id
                    }
                }
            })
        }

        if(!verifiedUser) throw new Error('Unable to find the post for you');
        return await prisma.mutation.updatePost({
            where: { id },
            data: {
                title,
                body,
                published
            }
        }, info);
     },
     async deletePost(parent, { id }, { prisma, request }, info) {

        const userId = getUserId(request);
        const postOwnerVerified = await prisma.exists.Post({
            id,
            author: { id: userId }
        });

        if(!postOwnerVerified) throw new Error('Unable to find the post.');

        return await prisma.mutation.deletePost({
            where: { id }
        }, info);
     },
     async createComment(parent, { data: { text, post }}, { prisma, request }, info) {
        const userId = getUserId(request);
        const commentingPost = await prisma.exists.Post({
            id: post,
            published: true
        });

        if(!commentingPost) throw new Error('The post is not published, Sorry');

        return await prisma.mutation.createComment({
           data: {
               text,
               author: {
                   connect: {
                       id: userId
                   }
               },
               post: {
                   connect: {
                       id: post
                   }
               }
           } 
        }, info);
     },
     async deleteComment(parent, { id }, { prisma , request }, info) {

        const userId = getUserId(request);
        const verifiedUser = await prisma.exists.Comment({
            id,
            author: { id: userId }
        });

        if(!verifiedUser) throw new Error('Unable to find comment for you.');

        return prisma.mutation.deleteComment({
            where: { id }
        }, info);
     },
     async updateComment(parent, { id, data: { text, post } }, { prisma, request }, info) {
        
        const userId = getUserId(request);
        
        const verifiedUser = await prisma.exists.Comment({
            id,
            author: {
                id: userId
            }
        });

        if(!verifiedUser) throw new Error('Unable to find your post and comment');

        return await prisma.mutation.updateComment({
            where: { id },
            data: {
                text,
                post: {
                    connect: {
                        id: post
                    }
                }
            }
        }, info);

     },
     async login(parent, { data: { email, password }}, { prisma }, info) {
        
        if(password.length < 8) 
            throw new Error('Password must be greater than 8 characgters');

        const user = await prisma.query.user({
             where: { email }
        });
        
        if(!user) throw new Error('Please, signup first.');

        const passwordVerified = await bcrypt.compare(password, user.password);
        if(!passwordVerified) throw new Error('Your password is wrong');

        const token = getToken(user.id);

        return { user, token };
     } 
}

export default Mutation;