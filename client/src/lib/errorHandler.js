import { toast } from "sonner";

export const handleApiError = (error, defaultMessage = "An error occurred") => {
    if (error.response) {
        // Validation Errors (422)
        if (error.response.status === 422 && error.response.data.errors) {
            Object.values(error.response.data.errors).flat().forEach(msg => {
                toast.error(msg);
            });
            return;
        }

        // Other API Errors
        if (error.response.data.message) {
            toast.error(error.response.data.message);
            return;
        }
    }

    // Network Errors or Default
    toast.error(defaultMessage);
    console.error(error);
};
