import mongoose, { Query, Schema } from "mongoose";

export interface IUserModel extends Document {
    username: string;
    name?: string;
    email: string;
    profilePic?: string;
    gender?: 'male' | 'female';
    age?: number;
    dob?: Date | number;
    bio?: string;
    interests: string[];
    password: string;
    role: 'user' | 'admin' | 'super-admin';
    otp?: string;
    otpExpiresAt?: Date | number;
    liked_posts: string[];
    saved_posts: string[];

    blocked: boolean;
    verified: boolean;
    deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    _id: string;
}

const UserModel = new Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 4,
        set: (value: string) => value.toLocaleLowerCase(),
    },

    name: {
        type: String,
        required: false
    },

    email: {
        type: String,
        required: true,
        unique: true,
        set: (value: string) => value.toLocaleLowerCase(),
    },

    profilePic: {
        type: String,
        required: false,
    },

    gender: {
        type: String,
        required: false,
        enum: ['male', 'female'],
    },

    age: {
        type: Number,
        required: false,
        min: 18,
        max: 120,
    },

    dob: {
        type: Date,
        required: false,
        set: (value: string) => {
            if (value) return new Date(value)
            return undefined;
        }
    },

    bio: {
        type: String,
        required: false
    },

    interests: [
        {
            type: String,
            required: false
        }
    ],

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        required: true,
        enum: ['user', 'admin', 'super-admin'],
        default: 'user'
    },

    // OTP Related Properties
    otp: {
        type: String,
        required: false
    },

    otpExpiresAt: {
        type: String,
        required: false,
        set: (value: string) => {
            if (value) return new Date(value)
            return undefined;
        }
    },

    // Post Related Properties
    liked_posts: [
        {
            type: String,
            required: false
        }
    ],

    saved_posts: [
        {
            type: String,
            required: false
        }
    ],



    // User status properties
    blocked: {
        type: Boolean,
        required: false,
        default: false
    },

    verified: {
        type: Boolean,
        required: false,
        default: false
    },

    deleted: {
        type: Boolean,
        required: false,
        default: false
    }

}, { timestamps: true })


// Pre-hook for all update operations to exclude sensitive fields from being updated
UserModel.pre(/^findOneAndUpdate|update|updateOne|updateMany$/, function (next) {

    // Ensure `this` is of type `Query` to use `getUpdate` method
    const query = this as unknown as Query<any, Document>;

    // Get the update object and remove sensitive fields if they are present
    const update = query.getUpdate() as { [key: string]: any };

    if (update.password) delete update.password;
    if (update.role && update.role !== 'user') delete update.role;

    query.setUpdate(update);
    next();
});

// Post-hook for all operations to exclude sensitive fields from the returned document
UserModel.post(/^save|findOneAndUpdate|update|updateOne|updateMany$/, function (result: Partial<IUserModel>, next) {
    if (result) {
        result.password = undefined;        // Remove password
        result.otp = undefined;             // Remove OTP
        result.otpExpiresAt = undefined;    // Remove OTP expiration
        result.verified = undefined;        // Remove verified status
        result.blocked = undefined;         // Remove blocked status
        result.deleted = undefined;         // Remove deleted status
        result.role = undefined;            // Remove role
    }
    next();
});


const User = mongoose.model<IUserModel>('User', UserModel);

export default User;