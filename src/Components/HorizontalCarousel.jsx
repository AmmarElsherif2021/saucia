import { motion, useTransform, useScroll } from 'framer-motion';
import { useRef } from 'react';
import { Box, Flex } from '@chakra-ui/react';

const HorizontalScrollCarousel = ({ plansData }) => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ['1%', `-${(plansData.length - 1) * 100}%`]);

    return (
        <Box ref={targetRef} position="relative" h="100vh" bg="gray.200">
            <Flex position="sticky" top="0" h="100vh" alignItems="center" overflow="hidden">
                <motion.div style={{ display: 'flex', gap: '1rem', x }}>
                    {plansData.map((plan, index) => (
                        <Card key={index} plan={plan} />
                    ))}
                </motion.div>
            </Flex>
        </Box>
    );
};

const Card = ({ plan }) => {
    return (
        <Box
            position="relative"
            h="350px"
            w="350px"
            overflow="hidden"
            bg="white"
            role="group"
            borderRadius={10}

        >
            <Box
                style={{
                    backgroundImage: `url(${plan.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                position="absolute"
                inset="0"
                zIndex="0"
                transition="transform 300ms"
                _groupHover={{ transform: 'scale(1.1)' }}
            />
            <Box position="absolute" inset="0" zIndex="10" display="grid" placeContent="end"></Box>
        </Box>
    );
};

export default HorizontalScrollCarousel;
