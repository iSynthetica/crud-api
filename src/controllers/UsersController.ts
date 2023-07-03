import { IncomingMessage, ServerResponse } from 'http';
type methods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
import { UserI, Users } from '../models/Users.js';

export class UsersController {
    private _allowedMethods: methods[];
    private _model: Users;

    constructor() {
        this._allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
        this._model = Users.getInstance();
    }

    public handleRequest(req: IncomingMessage, res: ServerResponse) {
        const method = req.method as methods;
        if (!this._allowedMethods.includes(method)) {
            this._handleError(res, 400, 'Method not allowed');
        }

        const id = (req.url as string).split('/')[3];

        if ((method === 'PUT' || method === 'DELETE') && !method) {
            this._handleError(res, 400, 'User ID is required');
        }

        if (id && (method === 'PUT' || method === 'DELETE' || method === 'GET')) {
            if (!this._model.validateId(id)) {
                this._handleError(res, 400, 'User ID is invalid');
            }
        }

        let data: UserI | UserI[] | string | boolean;

        if (method === 'POST') {
            const size = parseInt(req.headers['content-length'] as string, 10);
            const buffer = Buffer.allocUnsafe(size);
            var pos = 0;

            req.on('data', chunk => {
                const offset = pos + chunk.length;

                if (offset > size) {
                    this._handleError(res, 409, 'Bad Request');
                }
                chunk.copy(buffer, pos);
                pos = offset; 
            })
            .on('end', () => {
                if (pos !== size) {
                    this._handleError(res, 409, 'Bad Request');
                }

                const userData = JSON.parse(buffer.toString());
                console.log(userData);
                

                if (!this._model.validateRequest(userData)) {
                    this._handleError(res, 409, 'Username and age are required');
                }

                data = this._model.create(userData);

                this._handleResponse(res, 200, data);
            });
        } else if (method === 'GET') {
            if (id) {
                data = this._model.get(id);
            } else {
                data = this._model.getAll();
                this._handleResponse(res, 200, data);
            }
        }
    }

    private _handleError(res: ServerResponse, code: number, error: string) {
        res.statusCode = code;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error }));
    }

    private _handleResponse(res: ServerResponse, code: number, data: object) {
        res.statusCode = code;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ data }));
    }
}
