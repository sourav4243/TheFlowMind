"use client";

import { connectionIdToColor } from "@/lib/utils";
import { useOthers, useSelf } from "@liveblocks/react";

import { UserAvatar } from "./UserAvatar";

const MAX_SHOWN_USERS = 3;

export const Participants = () => {
    const users = useOthers();
    const currentUser = useSelf();
    const hasMoreUsers = users.length > MAX_SHOWN_USERS;

    return (
        <div className="absolute h-12 top-2 right-2 bg-white rounded-md p-3 flex items-center shadow-md">
            <div className="flex -space-x-2">
                {currentUser && (
                    <UserAvatar
                        borderColor={connectionIdToColor(currentUser.connectionId)}
                        src={currentUser.info?.picture}
                        name={`${currentUser.info?.name} (You)`}
                        fallback={currentUser.info?.name?.[0]}
                    />
                )}


                {   users.slice(0, MAX_SHOWN_USERS)
                    .map(({connectionId, info }) => {
                        return (
                            <UserAvatar
                                borderColor={connectionIdToColor(connectionId)}
                                key={connectionId}
                                src={info?.picture}
                                name={info?.name}
                                fallback={info?.name?.[0] || "T"}
                            />
                        )
                    })
                }

                {hasMoreUsers && (
                    <UserAvatar
                        borderColor={"#DB2777"}
                        name={`${users.length - MAX_SHOWN_USERS} more `}
                        fallback={`+${users.length - MAX_SHOWN_USERS}`}
                    />
                )}
            </div>
        </div>
    );
};

export const ParticipantsSkeleton = () => {
    return (
        <div className="absolute h-12 w-[100px] top-2 right-2 bg-white rounded-md p-3 flex items-center shadow-md"/>
    );
};