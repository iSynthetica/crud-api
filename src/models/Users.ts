import { v4 as uuidv4, version as uuidVersion, validate as uuidValidate } from 'uuid';

export interface UserI {
    id: string;
    username: string;
    age: number;
    hobbies?: [];
}

export class Users {
    private static instance: Users;
    private users: UserI[];
    private constructor() {
        this.users = [];
    }

    public static getInstance(): Users {
        if (!Users.instance) {
            Users.instance = new Users();
        }

        return Users.instance;
    }

    public validateId(uuid: string): boolean {
        return uuidValidate(uuid) && uuidVersion(uuid) === 4;
    }

    public validateRequest(userData: Omit<UserI, 'id'>): boolean {
        return typeof userData.username === 'string' && typeof userData.age === 'number';
    }

    public getAll(): UserI[] | false {
        return this.users.length ? this.users : false;
    }

    public get(id: string): UserI | false {
        const user = this.users.find(user => user.id === id);
        return user ? user : false;
    }

    public create(userData: UserI) {
        const { username, age, hobbies } = userData;
        const id = uuidv4();

        const newUser = {
            id,
            username,
            age,
            hobbies,
        };

        this.users.push(newUser);

        return newUser;
    }
}
