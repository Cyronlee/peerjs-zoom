"use client";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Center,
  Divider,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  useToast,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import MeetingRoom from "@/components/MeetingRoom";

const HomePage = () => {
  const toast = useToast();

  const [username, setUsername] = useState("");
  const [joinMeetingId, setJoinMeetingId] = useState("");
  const [inMeeting, setInMeeting] = useState(false);

  const hostMeeting = () => {
    if (username) {
      setInMeeting(true);
    } else {
      toast({
        status: "error",
        title: "Invalid input",
        description: "please fill you name",
      });
    }
  };

  if (inMeeting) {
    return (
      <MeetingRoom
        hostMeetingId={joinMeetingId}
        myUsername={username}
        onLeaveRoom={() => setInMeeting(false)}
      ></MeetingRoom>
    );
  }

  return (
    <VStack w="100vw" minH="100vh" bgColor="gray.300" paddingY="8vh">
      <VStack spacing="24px">
        <Heading>PeerJS Zoom</Heading>
        <Text>
          WebRTC peer-to-peer data, video, and audio calls, with no server.
        </Text>
        <Card maxW="sm">
          <CardBody>
            <VStack spacing="24px" alignItems="start">
              <Heading size="md">Create Meeting</Heading>
              <InputGroup>
                <InputLeftAddon>Your Name</InputLeftAddon>
                <Input
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your Name"
                />
              </InputGroup>
            </VStack>
          </CardBody>
          <Divider sx={{ borderColor: "gray.300" }} />
          <CardFooter justifyContent="flex-end">
            <Button
              size="sm"
              variant="solid"
              colorScheme="blue"
              onClick={() => hostMeeting()}
            >
              Create
            </Button>
          </CardFooter>
        </Card>

        <Card maxW="sm">
          <CardBody>
            <VStack spacing="24px" alignItems="start">
              <Heading size="md">Join Meeting</Heading>
              <InputGroup>
                <InputLeftAddon>Meeting ID</InputLeftAddon>
                <Input
                  placeholder="Metting ID"
                  onChange={(e) => setJoinMeetingId(e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <InputLeftAddon>Your Name</InputLeftAddon>
                <Input
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your Name"
                />
              </InputGroup>
            </VStack>
          </CardBody>
          <Divider sx={{ borderColor: "gray.300" }} />
          <CardFooter justifyContent="flex-end">
            <Button
              size="sm"
              variant="solid"
              colorScheme="blue"
              onClick={() => hostMeeting()}
            >
              Join
            </Button>
          </CardFooter>
        </Card>
      </VStack>
    </VStack>
  );
};

export default HomePage;
