import jwt from 'jsonwebtoken';

export default (request, requireAuth = true) => {

    const header = request.request ?  
        request.request.headers.authorization :
        request.connection.context.Authorization;

    if(header) {
        const token = header.replace('Bearer ', '');
        const decode = jwt.verify(token, process.env.PRISMA_JWT_SECRET)
        return decode.userId;
    }

    if(requireAuth) {
        throw new Error('Authentication required.');
    }

    return null;

}