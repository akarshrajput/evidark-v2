import React from "react";
import LinkButton from "../buttons/LinkButton";

const TrendTopics = () => {
  return (
    <div className="p-2 flex items-center justify-center gap-4 text-sm">
      <LinkButton>Dark Crimes</LinkButton>
      <LinkButton>Occult & Witchcraft</LinkButton>
      <LinkButton>Paranormal & Ghosts</LinkButton>
      <LinkButton>Conspiracies & Hidden Truths</LinkButton>
      <LinkButton>Thriller Documentaries</LinkButton>
      <LinkButton>Myths & Legends</LinkButton>
      <LinkButton>Secret Places</LinkButton>
    </div>
  );
};

export default TrendTopics;
