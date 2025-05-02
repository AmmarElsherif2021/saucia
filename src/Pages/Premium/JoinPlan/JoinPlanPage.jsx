import { Box, Heading } from "@chakra-ui/react";
import { useState } from "react";
import CommonQuestions from "./CommonQuestions";
import BodyHealthQuestions from "./BodyHealthQuestions";
import RecommendedPlan from "./RecommendedPlan";
const JoinPlanPage = () => {
    const [applicationPhase, setApplicationPhase] = useState(0);
    
    // Create a handler function that will be called when needed
    const handlePhaseChange = () => {
        setApplicationPhase((prev) => (prev + 1) % 3);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you can handle the form submission logic
        console.log("Form submitted with data:", formData);
        setApplicationPhase((prev) => (prev + 1) % 3);
    }
    
    return (
        <>
            <Heading as="h1" size="xl" textAlign="center" color="brand.500">
                Join Premium Plan
            </Heading>
            {applicationPhase=== 0 && <CommonQuestions setApplicationPhase={handlePhaseChange} />}
            {applicationPhase === 1 && (<BodyHealthQuestions setApplicationPhase={handlePhaseChange} />)}
            {applicationPhase === 2 && (<RecommendedPlan setApplicationPhase={handlePhaseChange} />)}
        </>
    );
};

export default JoinPlanPage;