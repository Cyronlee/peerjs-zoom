import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Center,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
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
  const handleDataReceived = (dataConn: any, data: any) => {
    console.log("data received");
    if (data?.type === "player-connected") {
      addPlayer({
        id: dataConn.peer,
        name: data?.data?.username,
        isMe: false,
        isHost: dataConn.peer === hostMeetingId,
        dataConn: dataConn,
      });
    } else {
      toast({
        status: "info",
        title: "New message",
        description: `${getPlayer(dataConn.peer)?.name}: ${data}`,
      });
    }
  };

  const [peer, setPeer] = useState<any>(null);

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

  // const [localMediaStream, setLocalMediaStream] = useState(null);
  const [isMyVideoOn, setIsMyVideoOn] = useState(false);
  const [isMyAudioOn, setIsMyAudioOn] = useState(false);

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
            isHost: !hostMeetingId,
          });
          console.log(`peer on open with id: ${id}`);
        });

        peer.on("connection", function (dataConn) {
          console.log(`receive data connection from ${dataConn.peer}`);

          // add others
          // addPlayer({
          //   id: conn.peer,
          //   name: conn.metadata?.username,
          //   isMe: false,
          //   isHost: conn.peer === hostMeetingId,
          //   peerConn: conn,
          // });

          dataConn.on("open", function () {
            dataConn.send({
              type: "player-connected",
              data: {
                username: myUsername,
              },
            });
          });

          dataConn.on("data", function (data) {
            handleDataReceived(dataConn, data);
          });

          dataConn.on("close", () => {
            removePlayer(dataConn.peer);
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
        });
      } catch (err: any) {
        toast({
          status: "error",
          title: "Connection error",
          description: err.type,
        });
      }
    })();
  }, [hostMeetingId]);

  useEffect(() => {
    if (peer && hostMeetingId) {
      connectToMeeting(hostMeetingId);
    }
  }, [peer]);

  const connectToMeeting = (id: string) => {
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
      // addPlayer({
      //   id: dataConn.peer,
      //   name: dataConn.metadata?.username,
      //   isMe: false,
      //   isHost: dataConn.peer === hostMeetingId,
      //   peerConn: dataConn,
      // });
    });
    dataConn.on("data", (data: any) => {
      handleDataReceived(dataConn, data);
    });
    dataConn.on("close", () => {
      removePlayer(dataConn.peer);
    });
    dataConn.on("error", (err: any) => {
      console.error(err);
    });
  };

  // share my video & audio
  useEffect(() => {
    if (!peer) return;
    if (!isMyVideoOn && !isMyAudioOn) {
      setPlayerStream(peer.id, null);
      otherPlayers(peer.id).forEach((player) => {
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
        otherPlayers(peer.id).forEach((player) => {
          const mediaConn = peer.call(player.id, localStream);
          console.log(`calling to ${player.id}`);
          setPlayerMediaConn(player.id, mediaConn);
          mediaConn.on("stream", function (remoteStream: any) {
            setPlayerStream(player.id, remoteStream);
          });
        });
      },
      function (err: any) {
        console.log("Failed to get local stream", err);
      },
    );
  }, [isMyVideoOn, isMyAudioOn]);

  const handleClickLeaveRoom = () => {
    peer.destroy();
    clearPlayers();
    onLeaveRoom();
  };

  const pingAllPlayers = () => {
    otherPlayers(peer.id).forEach(
      (player) => player.dataConn && player.dataConn.send("Pings you"),
    );
  };

  return (
    <Box w="100vw" h="100vh">
      <Center h="64px" bgColor="#1b1b1b" justifyContent="space-around">
        <Text color="white" fontWeight="bold">
          Meeting ID: {hostMeetingId}
        </Text>
        <Text color="white" fontWeight="bold">
          My Username: {myUsername}
        </Text>
        <Text color="white" fontWeight="bold">
          My ID: {peer?.id}
        </Text>
      </Center>
      <SimpleGrid
        h="calc(100vh - 64px)"
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
      <Center h="64px" bgColor="#1b1b1b" justifyContent="space-around">
        <Button
          size="sm"
          onClick={() => setIsMyAudioOn((prevState) => !prevState)}
        >
          {isMyAudioOn ? "Mute" : "Unmute"}
        </Button>
        <Button
          size="sm"
          onClick={() => setIsMyVideoOn((prevState) => !prevState)}
        >
          {isMyVideoOn ? "Close Video" : "Open Video"}
        </Button>
        <Button size="sm" onClick={() => pingAllPlayers()}>
          Ping
        </Button>
        <Button
          size="sm"
          colorScheme="red"
          onClick={() => handleClickLeaveRoom()}
        >
          Leave Room
        </Button>
      </Center>
    </Box>
  );
};

export default MeetingRoom;
