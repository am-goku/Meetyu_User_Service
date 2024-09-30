import User, { IUserModel } from "../model/UserModel";

class UserRepository {
    constructor() { };

    // Single user fetch
    async fetchByID(id: string): Promise<IUserModel | null> {
        return await User.findById(id);
    }

    async fetchByUsername(username: string): Promise<IUserModel | null> {
        return await User.findOne({ username: username });
    }

    async fetchByName(searchKey: string): Promise<IUserModel[]> {
        return await User.find({
            $or: [
                { username: { $regex: searchKey, $options: "i" } },
                { name: { $regex: searchKey, $options: "i" } }
            ]
        });
    }

    async fetchByEmail(email: string): Promise<IUserModel | null> {
        return await User.findOne({ email: email });
    }


    // Multiple user fetch
    async fetchAll(page: number, limit: number, role: string = "user"): Promise<IUserModel[]> {
        const skip = (page - 1) * limit;
        return await User.find({ role })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async fetchByInterests(interests: string[]): Promise<IUserModel[]> {
        return await User.find({ interests: { $in: interests } });
    }


    // User creation, updation and deletion
    async create(user: Partial<IUserModel>): Promise<IUserModel> {
        const newUser = new User(user);
        return await newUser.save();
    }

    async update(id: string, user: Partial<IUserModel>): Promise<IUserModel | null> {
        const updateObject: any = {
            $set: {},
            $unset: {}
        };

        // Iterate through keys of the user object
        for (const key in user) {
            if (user.hasOwnProperty(key)) {
                const typedKey = key as keyof Partial<IUserModel>; // Type assertion
                if (user[typedKey] === undefined) {
                    updateObject.$unset[typedKey] = ""; // unset the field
                } else {
                    updateObject.$set[typedKey] = user[typedKey]; // set the field
                }
            }
        }

        return await User.findOneAndUpdate({ _id: id }, updateObject, { new: true });
    }

    async softDelete(id: string): Promise<IUserModel | null> {
        return await User.findOneAndUpdate({ _id: id }, { $set: { $delete: true } }, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        return (await User.deleteOne({ _id: id })).deletedCount === 1;
    }

    async block(id: string): Promise<IUserModel | null> {
        return await User.findOneAndUpdate({ _id: id }, { $set: { blocked: true } });
    }

    async unblock(id: string): Promise<IUserModel | null> {
        return await User.findOneAndUpdate({ _id: id }, { $set: { blocked: false } });
    }

    async verify(id: string): Promise<IUserModel | null> {
        return await User.findOneAndUpdate({ _id: id }, { $set: { verified: true } });
    }

    async likePost(userId: string, postId: string): Promise<IUserModel | null> {
        return await User.findOneAndUpdate(
            { _id: userId, liked_posts: { $ne: postId } },
            { $push: { liked_posts: postId } },
            { new: true }
        ).exec();
    }

    async unlikePost(userId: string, postId: string): Promise<IUserModel | null> {
        return await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { liked_posts: postId } },
            { new: true }
        ).exec();
    }

    async savePost(userId: string, postId: string): Promise<IUserModel | null> {
        return await User.findOneAndUpdate(
            { _id: userId, saved_posts: { $ne: postId } },
            { $push: { saved_posts: postId } },
            { new: true }
        ).exec();
    }

    async unsavePost(userId: string, postId: string): Promise<IUserModel | null> {
        return await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { saved_posts: postId } },
            { new: true }
        ).exec();
    }

}

export default new UserRepository();