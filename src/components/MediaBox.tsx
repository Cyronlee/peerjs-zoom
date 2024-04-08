import React, { useEffect, useRef } from "react";
import { Badge, Center, Text } from "@chakra-ui/react";
import { showVideo } from "@/lib/media";

const MediaBox = ({
  mediaStream,
  isMe,
  username,
  isHost,
  isAudioOn,
}: {
  mediaStream?: any;
  isMe?: boolean;
  username?: string;
  isHost?: boolean;
  isAudioOn?: boolean;
}) => {
  const videoRef = useRef();

  useEffect(() => {
    if (mediaStream) {
      console.log(mediaStream);
      showVideo(mediaStream, videoRef.current, false);
    }
  }, [mediaStream]);

  return (
    <Center
      maxH="480px"
      maxW="480px"
      bg="#242424"
      sx={{ position: "relative" }}
    >
      {mediaStream ? (
        <video playsInline={true} ref={videoRef} width="100%" height="100%" />
      ) : (
        <Center bg="black" height="50%" w="50%">
          <Text color="white" fontSize="2xl">
            {username}
          </Text>
        </Center>
      )}
      <Badge
        variant="outline"
        color="white"
        sx={{ position: "absolute", left: 0, bottom: 0, textTransform: "none" }}
      >
        {username} {isHost && "- HOST"}
      </Badge>
    </Center>
  );
};

export default MediaBox;