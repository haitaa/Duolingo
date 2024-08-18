import { auth } from "@clerk/nextjs/server"

const allowedIds = [
    "user_2kNQu94mh2rjDsC6RxcEPlpOA7y",
]

export const isAdmin = () => {
    const { userId } = auth();

    if(!userId) {
        return false;
    }

    return allowedIds.indexOf(userId) !== -1;
}