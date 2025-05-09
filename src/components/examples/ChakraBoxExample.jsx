"use client"

import React from 'react'
import { Box, Flex, VStack, HStack, Text, Heading, Container, Grid, GridItem } from '@chakra-ui/react'

/**
 * EXEMPLE - Composant utilisant Box, Flex et autres conteneurs de Chakra UI
 * Ce fichier sert d'exemple pour la migration vers Tailwind CSS
 */
export function ChakraBoxExample() {
  return (
    <div>
      <Heading as="h2" size="xl" mb={6}>
        Exemples de Conteneurs Chakra UI
      </Heading>
      
      {/* Box simple */}
      <Box
        p={5}
        shadow="md"
        borderWidth="1px"
        borderRadius="md"
        bg="white"
        mb={6}
      >
        <Heading as="h3" size="md" mb={4}>
          Box simple
        </Heading>
        <Text>
          Un composant Box basique avec padding, ombre, bordure et rayon de bordure.
        </Text>
      </Box>

      {/* Container */}
      <Container maxW="container.md" centerContent mb={6}>
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="gray.50" w="100%">
          <Heading as="h3" size="md" mb={4}>
            Container centré
          </Heading>
          <Text>
            Un conteneur avec une largeur maximale, centré horizontalement.
          </Text>
        </Box>
      </Container>

      {/* Flex */}
      <Flex 
        justify="space-between" 
        align="center" 
        p={4} 
        mb={6}
        bg="blue.50" 
        borderRadius="md"
      >
        <Box p={2} bg="blue.200" borderRadius="md">
          Élément 1
        </Box>
        <Box p={2} bg="blue.300" borderRadius="md">
          Élément 2
        </Box>
        <Box p={2} bg="blue.400" borderRadius="md">
          Élément 3
        </Box>
      </Flex>

      {/* VStack */}
      <VStack
        spacing={4}
        align="stretch"
        p={4}
        mb={6}
        bg="green.50"
        borderRadius="md"
      >
        <Box p={2} bg="green.200" borderRadius="md">
          Élément vertical 1
        </Box>
        <Box p={2} bg="green.300" borderRadius="md">
          Élément vertical 2
        </Box>
        <Box p={2} bg="green.400" borderRadius="md">
          Élément vertical 3
        </Box>
      </VStack>

      {/* HStack */}
      <HStack
        spacing={4}
        p={4}
        mb={6}
        bg="purple.50"
        borderRadius="md"
      >
        <Box p={2} bg="purple.200" borderRadius="md">
          Élément horizontal 1
        </Box>
        <Box p={2} bg="purple.300" borderRadius="md">
          Élément horizontal 2
        </Box>
        <Box p={2} bg="purple.400" borderRadius="md">
          Élément horizontal 3
        </Box>
      </HStack>

      {/* Grid */}
      <Grid
        templateColumns="repeat(3, 1fr)"
        gap={6}
        p={4}
        mb={6}
        bg="orange.50"
        borderRadius="md"
      >
        <GridItem p={2} bg="orange.200" borderRadius="md">
          Cellule 1
        </GridItem>
        <GridItem p={2} bg="orange.300" borderRadius="md">
          Cellule 2
        </GridItem>
        <GridItem p={2} bg="orange.400" borderRadius="md">
          Cellule 3
        </GridItem>
        <GridItem p={2} bg="orange.500" borderRadius="md">
          Cellule 4
        </GridItem>
        <GridItem p={2} bg="orange.600" borderRadius="md">
          Cellule 5
        </GridItem>
        <GridItem p={2} bg="orange.700" borderRadius="md">
          Cellule 6
        </GridItem>
      </Grid>

      {/* Box avec styles conditionnels */}
      <Box
        p={5}
        bg={{ base: "red.50", md: "blue.50", lg: "green.50" }}
        color={{ base: "red.500", md: "blue.500", lg: "green.500" }}
        borderRadius="md"
        mb={6}
      >
        <Heading as="h3" size="md" mb={4}>
          Box avec styles responsifs
        </Heading>
        <Text>
          Ce Box change de couleur selon la taille de l&apos;écran.
        </Text>
      </Box>

      {/* Box avec pseudo-classes */}
      <Box
        p={5}
        bg="gray.100"
        borderRadius="md"
        _hover={{ bg: "blue.100" }}
        _active={{ bg: "blue.200" }}
        transition="all 0.2s"
        cursor="pointer"
      >
        <Heading as="h3" size="md" mb={4}>
          Box avec pseudo-classes
        </Heading>
        <Text>
          Survolez ce box pour voir la couleur changer.
        </Text>
      </Box>
    </div>
  )
} 