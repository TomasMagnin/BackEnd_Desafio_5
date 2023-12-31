export function isUser(req, res, next) {
    if(req.session?.email){
        return next();
    }
    return res.status(401).render('error', {error: "Authentication Error"});
};

export function isAdmin(req, res, next) {
    if(req.session?.isAdmin){
        return next();
    }
    return res.status(401).render('error', {error: "Authentication Error"});
};