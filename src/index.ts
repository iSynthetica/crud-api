import 'dotenv/config';
import http, { IncomingMessage, Server, ServerResponse } from 'http';
import { URL } from 'url';
import { UsersController } from './controllers/UsersController.js';

interface Resources {
    users: UsersController;
}
const allowedResources: Resources = {
    users: new UsersController(),
};

const port = process.env.MAIN_PORT || 4000;

const handleError = (res: ServerResponse, code: number, error: string) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error }));
};

const server: Server = http.createServer();

server.on('request', (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url || !req.url.startsWith('/api')) {
        return handleError(res, 404, 'Resource not found');
    }
    const resource = (req.url as string).split('/')[2];
    
    if (!resource || !allowedResources[resource as keyof Resources]) {
        return handleError(res, 404, 'Resource not found');
    }

    return allowedResources[resource as keyof Resources].handleRequest(req, res);
});

console.log(port);

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
