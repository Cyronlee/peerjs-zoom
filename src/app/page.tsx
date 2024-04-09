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
  Link,
  Text,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import React, { useState } from "react";
import MeetingRoom from "@/components/MeetingRoom";
import { BsGithub } from "react-icons/bs";
import { motion } from "framer-motion";

const MotionFadeIn = ({ children }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

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
      <MotionFadeIn>
        <MeetingRoom
          hostMeetingId={joinMeetingId}
          myUsername={username}
          onLeaveRoom={() => setInMeeting(false)}
        ></MeetingRoom>
      </MotionFadeIn>
    );
  }

  return (
    <VStack w="100vw" minH="100vh" bgColor="gray.300" paddingY="8vh">
      <VStack spacing="24px">
        <HStack>
          <Heading>PeerJS Zoom</Heading>
          <IconButton
            variant="outline"
            color="black"
            colorScheme="none"
            aria-label="Mute"
            size="sm"
            fontSize="20px"
            onClick={() =>
              window.open("https://github.com/Cyronlee/peerjs-zoom")
            }
            icon={<BsGithub />}
          />
        </HStack>
        <Text>
          WebRTC P2P data, video, and audio calls, built with{" "}
          <Link
            sx={{ textDecoration: "underline" }}
            isExternal
            href="https://peerjs.com/"
          >
            peerjs
          </Link>
        </Text>
        <MotionFadeIn>
          <Card w="sm">
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
        </MotionFadeIn>
        <MotionFadeIn>
          <Card w="sm">
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
        </MotionFadeIn>
        <MotionFadeIn>
          <Card w="sm">
            <CardBody>
              <VStack spacing="24px" alignItems="start">
                <Heading size="md">Features</Heading>
                <Text>👥 Supports multiple user in one room.</Text>
                <Text>
                  🌐 Accessible via any web browser, such as Chrome and Safari.
                </Text>
                <Text>
                  🔐 Secured P2P connection base on WebRTC, data transfers
                  directly between clients, without any servers.
                </Text>
                <Text>
                  👨‍💻 Open-source, welcome to{" "}
                  <Link
                    sx={{ textDecoration: "underline" }}
                    isExternal
                    href="https://github.com/Cyronlee/peerjs-zoom"
                  >
                    contribute code.
                  </Link>
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </MotionFadeIn>
      </VStack>
    </VStack>
  );
};

export default HomePage;
