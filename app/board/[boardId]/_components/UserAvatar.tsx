import { Hint } from "@/components/Hint";
import {
    Avatar, 
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

interface UserAvatarProps {
    src?: string;
    name?: string;
    fallback?: string;
    borderColor?: string;
};

export const UserAvatar = ({
    src,
    name, 
    fallback, 
    borderColor,
}: UserAvatarProps) => {
    return (
        <Hint label={name || "Teammate"} side="bottom" sideOffset={18}>
            <Avatar
                className="h-8 w-8 border-2 hover:z-10 transition-transform hover:scale-110 cursor-pointer"
                style={{ 
                    borderColor,
                    boxShadow: '0 0 0 2px white'
                }}
            >
                <AvatarImage src={src}/>
                <AvatarFallback 
                    className="text-xs font-semibold" 
                    style={{ 
                        color: borderColor, 
                        backgroundColor: `${borderColor}33` 
                    }}
                >
                    {fallback}
                </AvatarFallback>
            </Avatar>
        </Hint>
    );
};