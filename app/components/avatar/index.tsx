"use client";

import { bigSmile } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import Image from "next/image";
import { useMemo } from "react";

interface AvatarProps {
  slug: string;
  size?: number;
}

export const Avatar = (props: AvatarProps) => {
  const size = props.size ?? 48;
  const avatar = useMemo(() => {
    return createAvatar(bigSmile, {
      seed: props.slug,
      size: size,
    }).toDataUri();
  }, [props.slug, size]);

  return <Image src={avatar} alt="Avatar" width={size} height={size} />;
};
