import React, { forwardRef } from "react";
import { LinearTimeline, LinearTimelineRef } from "./linear/LinearTimeline";
import { CircularTimeline } from "./circular/CircularTimeline";

// Define ref interface for Timeline component
export interface TimelineRef {
  scrollToCurrentTime: () => void;
}

/**
 * Timeline component - main entry point that switches between
 * linear (horizontal scroll) and circular (radial) view modes
 */
type TimelineProps = {
  date?: Date;
  bottomPadding?: number;
  viewMode?: "linear" | "circular";
};

const Timeline = forwardRef<TimelineRef, TimelineProps>(
  ({ date, bottomPadding = 0, viewMode = "linear" }, ref) => {
    const linearTimelineRef = React.useRef<LinearTimelineRef>(null);

    // Expose scrollToCurrentTime method (only works in linear mode)
    React.useImperativeHandle(ref, () => ({
      scrollToCurrentTime: () => {
        if (viewMode === "linear" && linearTimelineRef.current) {
          linearTimelineRef.current.scrollToCurrentTime();
        }
      },
    }));

    // Render circular view
    if (viewMode === "circular") {
      return <CircularTimeline date={date} bottomPadding={bottomPadding} />;
    }

    // Render linear view (default)
    return (
      <LinearTimeline
        ref={linearTimelineRef}
        date={date}
        bottomPadding={bottomPadding}
      />
    );
  }
);

export default Timeline;
