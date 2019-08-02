import getUserId from '../utils/getUserId';

const Query = {
    users(parent, { query, first, skip, after, orderBy }, { prisma }, info) {
        
        const opArgs = {
            first,
            skip,
            after,
            orderBy
        };

        if(query) {
            opArgs.where = {
                AND: [{
                    name_contains: query
                }]                                 
            }
        }

        return prisma.query.users(opArgs, info);
    },
    myPosts(parent, { query, first, skip, after, orderBy }, { prisma, request }, info) {
        const userId = getUserId(request);
        const opArgs = {
            first,
            skip,
            after,
            orderBy,
            where: {
                author: {
                    id: userId
                }
            }
        };
        if(query) {
            opArgs.where.OR = [{
                title_contains: query
            }, {
                body_contains: query
            }] 
        }
        const posts = prisma.query.posts(opArgs, info);
        if(posts.length === 0) throw new Error('Your posts are not availabl.');
        
        return posts;
    },
    posts(parent, { query, first, skip, after, orderBy }, { prisma }, info) {

        const opArgs = {
            first,
            skip,
            after,
            orderBy,
            where: {
                published: true
            }
        };

        if(query) {
            opArgs.where.OR = [{
                title_contains: query
            }, {
                body_contains: query
            }]
        };

        return prisma.query.posts( opArgs, info );
    },
    comments(parent, { first, skip, after, orderBy }, { prisma }, info) {
        const opArgs = {
            first,
            skip,
            after,
            orderBy
        };

        return prisma.query.comments(opArgs, info);

    },
    async me(parent, args, { prisma, request }, info) {
        
        const userId = getUserId(request);
        const user = await prisma.query.user({
            where: { id: userId }
        }, info);

        if(!user) throw new Error('Unable to find the user');

        return user;
    },
    async post(parent, { id }, { prisma, request }, info) {
        const userId = getUserId(request, false);
        const [ post ] = await prisma.query.posts({
            where: {
                id,
                OR: [{
                    published: true
                }, {
                    author: {
                        id: userId
                    }
                }]
            }
        }, info);

        if(!post) throw new Error('Unabl to find the post');

        return post;       
    }
}

export default Query;