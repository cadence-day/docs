import React from "react";
import { GridImage } from "./GridImage";
import { TimelineImage } from "./TimelineImage";
import { NoteImage } from "./NoteImage";

interface ImageContainerProps {
  type: "time-logging" | "pattern-view" | "note-taking";
}

export const ImageContainer: React.FC<ImageContainerProps> = ({ type }) => {
  const renderImage = () => {
    switch (type) {
      case "time-logging":
        return <TimelineImage />;
      case "pattern-view":
        return <GridImage />;
      case "note-taking":
        return <NoteImage />;
      default:
        return null;
    }
  };

  return renderImage();
};