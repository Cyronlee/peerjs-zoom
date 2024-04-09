import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Badge,
  SimpleGrid,
  Text,
  HStack,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import {
  BsFillMicFill,
  BsFillMicMuteFill,
  BsFillCameraVideoFill,
  BsFillCameraVideoOffFill,
} from "react-icons/bs";

import MediaBox from "@/components/MediaBox";
import { usePlayerStore } from "@/store/player-store";
import { randomId } from "@/lib/random";

const MeetingRoom = ({
  hostMeetingId,
  myUsername,
  onLeaveRoom,
}: {
  hostMeetingId: string;
  myUsername: string;
  onLeaveRoom: any;
}) => {
  const toast = useToast();

  const [peer, setPeer] = useState<any>(null);
  const [isMyVideoOn, setIsMyVideoOn] = useState(false);
  const [isMyAudioOn, setIsMyAudioOn] = useState(false);

  const {
    players,
    otherPlayers,
    addPlayer,
    getPlayer,
    removePlayer,
    clearPlayers,
    setPlayerStream,
    setPlayerMediaConn,
  } = usePlayerStore();

  const isMeetingHost = !hostMeetingId;

  // init peer instance and register events as a receiver
  useEffect(() => {
    (async function initPeer() {
      try {
        const { Peer } = await import("peerjs");
        const peer = new Peer(randomId(5));

        peer.on("open", (id) => {
          setPeer(peer);
          // add self
          addPlayer({
            id: peer.id,
            name: myUsername,
            isMe: true,
            isHost: isMeetingHost,
          });
          console.log(`peer on open with id: ${id}`);
        });

        peer.on("connection", function (dataConn) {
          console.log(`receive data connection from ${dataConn.peer}`);

          dataConn.on("open", function () {
            dataConn.send({
              type: "player-connected",
              data: {
                username: myUsername,
                isHost: isMeetingHost,
              },
            });
            if (isMeetingHost) {
              dataConn.send({
                type: "other-players",
                data: otherPlayers()
                  .filter((player) => player.id !== dataConn.peer)
                  .map((player) => ({
                    id: player.id,
                    username: player.name,
                    isHost: player.isHost,
                  })),
              });
            }
          });

          dataConn.on("data", function (data) {
            handleDataReceived(dataConn, data);
          });

          dataConn.on("close", () => {
            handlePlayerDisconnected(dataConn);
          });
        });

        peer.on("call", function (mediaConn) {
          console.log("peer on call");
          console.log(mediaConn);
          mediaConn.answer();
          mediaConn.on("stream", function (remoteStream) {
            // Show stream in some video/canvas element.
            console.log("peer on call with stream");
            setPlayerStream(mediaConn.peer, remoteStream);
          });
        });

        peer.on("disconnected", () => {
          console.log("peer on disconnected");
        });

        peer.on("error", (err) => {
          console.error(err);
          handleLeaveRoom();
          toast({
            status: "error",
            title: "Connection error",
            description: err.type,
          });
        });
      } catch (err: any) {
        console.error(err);
        handleLeaveRoom();
        toast({
          status: "error",
          title: "Connection error",
          description: err.type,
        });
      }
    })();
  }, [hostMeetingId]);

  // auto join meeting after peer instance built
  useEffect(() => {
    if (peer && hostMeetingId) {
      connectPlayer(hostMeetingId);
    }
  }, [peer]);

  // share my video & audio to all players
  useEffect(() => {
    if (!peer) return;
    if (!isMyVideoOn && !isMyAudioOn) {
      setPlayerStream(peer.id, null);
      otherPlayers().forEach((player) => {
        if (player.mediaConn) {
          player.mediaConn.close();
        }
      });
      return;
    }
    navigator.getUserMedia(
      { video: isMyVideoOn, audio: isMyAudioOn },
      function (localStream: any) {
        setPlayerStream(peer.id, localStream);

        // establish media connection with other players
        otherPlayers().forEach((player) => {
          const mediaConn = peer.call(player.id, localStream);
          console.log(`calling to ${player.id}`);
          setPlayerMediaConn(player.id, mediaConn);
          mediaConn.on("stream", function (remoteStream: any) {
            setPlayerStream(player.id, remoteStream);
          });
        });
      },
      function (err: any) {
        console.error(err);
      },
    );
  }, [isMyVideoOn, isMyAudioOn]);

  const handleDataReceived = (dataConn: any, data: any) => {
    console.log(
      `data received form: ${dataConn.peer} data: ${JSON.stringify(data)}`,
    );
    if (data?.type === "player-connected") {
      addPlayer({
        id: dataConn.peer,
        name: data?.data?.username,
        isMe: false,
        isHost: data?.data?.isHost,
        dataConn: dataConn,
      });
    } else if (data?.type === "other-players") {
      data?.data?.forEach((otherPlayer) => {
        connectPlayer(otherPlayer?.id);
      });
    } else {
      toast({
        status: "info",
        title: "New message",
        description: `${getPlayer(dataConn.peer)?.name}: ${data}`,
      });
    }
  };

  const connectPlayer = (id: string) => {
    console.log(`connecting to ${id}: `);
    const dataConn = peer.connect(id, {
      metadata: {
        username: myUsername,
      },
    });
    dataConn.on("open", function () {
      // here you have conn.id
      console.log(`host ${id} connected`);
      console.log(dataConn);
      dataConn.send({
        type: "player-connected",
        data: {
          username: myUsername,
        },
      });
    });
    dataConn.on("data", (data: any) => {
      handleDataReceived(dataConn, data);
    });
    dataConn.on("close", () => {
      handlePlayerDisconnected(dataConn);
    });
    dataConn.on("error", (err: any) => {
      console.error(err);
    });
  };

  const handleLeaveRoom = () => {
    peer?.destroy();
    clearPlayers();
    onLeaveRoom();
  };

  const handlePlayerDisconnected = (dataConn) => {
    if (getPlayer(dataConn.peer)?.isHost) {
      toast({
        status: "warning",
        title: "Host left",
        description: "Meeting is over cus host left this room",
      });
      handleLeaveRoom();
    } else {
      removePlayer(dataConn.peer);
    }
  };

  const pingAllPlayers = () => {
    otherPlayers().forEach(
      (player) => player.dataConn && player.dataConn.send("Pings you"),
    );
  };

  return (
    <Box w="100vw" h="100vh">
      {/*<Center h="64px" bgColor="#1b1b1b" justifyContent="space-around">*/}
      {/*  <Text color="white" fontWeight="bold">*/}
      {/*    My Username: {myUsername}*/}
      {/*  </Text>*/}
      {/*  <Text color="white" fontWeight="bold">*/}
      {/*    My ID: {peer?.id}*/}
      {/*  </Text>*/}
      {/*</Center>*/}
      <Center
        h="64px"
        paddingX="24px"
        bgColor="#1b1b1b"
        justifyContent="space-between"
      >
        <ButtonGroup>
          <IconButton
            variant="outline"
            color="white"
            colorScheme="none"
            aria-label="Mute"
            size="sm"
            fontSize="20px"
            onClick={() => setIsMyAudioOn((prevState) => !prevState)}
            icon={isMyAudioOn ? <BsFillMicFill /> : <BsFillMicMuteFill />}
          />
          <IconButton
            variant="outline"
            color="white"
            colorScheme="none"
            aria-label="Mute"
            fontSize="20px"
            size="sm"
            onClick={() => setIsMyVideoOn((prevState) => !prevState)}
            icon={
              isMyVideoOn ? (
                <BsFillCameraVideoFill />
              ) : (
                <BsFillCameraVideoOffFill />
              )
            }
          />
          <Button size="sm" colorScheme="blue" onClick={() => pingAllPlayers()}>
            Ping
          </Button>
        </ButtonGroup>
        <HStack>
          <Text color="white" fontSize="md" fontWeight="bold">
            Meeting ID:
          </Text>
          <Badge
            colorScheme="gray"
            fontSize="md"
            sx={{
              textTransform: "none",
            }}
          >
            {hostMeetingId || peer?.id || "connecting.."}
          </Badge>
        </HStack>
        <Button size="sm" colorScheme="red" onClick={() => handleLeaveRoom()}>
          Leave Room
        </Button>
      </Center>
      <SimpleGrid
        minH="calc(100vh - 64px)"
        bgColor="#111111"
        minChildWidth="480px"
        spacing="8px"
      >
        {players.map((player) => (
          <MediaBox
            key={player.id}
            username={player.name}
            isMe={player.isMe}
            isHost={player.isHost}
            isAudioOn={player.isAudioOn}
            mediaStream={player.mediaStream}
          ></MediaBox>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default MeetingRoom;
