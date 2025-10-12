// Utility to check if we are in development mode
export const isDev = __DEV__;

// Debug container styling - toggle to show magenta borders on all containers
// Set to true to enable debug borders across the app
export const DEBUG_CONTAINER_STYLING = false && isDev;

// Debug styling utilities
export const debugContainerStyle = DEBUG_CONTAINER_STYLING
    ? {
        borderWidth: 1,
        borderColor: "magenta",
    }
    : {};

export const debugContainerStyleThick = DEBUG_CONTAINER_STYLING
    ? {
        borderWidth: 2,
        borderColor: "magenta",
    }
    : {};

export const debugContainerStyleDashed = DEBUG_CONTAINER_STYLING
    ? {
        borderWidth: 1,
        borderColor: "magenta",
        borderStyle: "dashed" as const,
    }
    : {};

// Utility function to conditionally apply debug styling
export const withDebugBorder = (style: Record<string, unknown> = {}) => ({
    ...style,
    ...debugContainerStyle,
});

// Utility function for thick debug borders (for main containers)
export const withDebugBorderThick = (style: Record<string, unknown> = {}) => ({
    ...style,
    ...debugContainerStyleThick,
});

// Utility function for dashed debug borders (for nested containers)
export const withDebugBorderDashed = (style: Record<string, unknown> = {}) => ({
    ...style,
    ...debugContainerStyleDashed,
});
