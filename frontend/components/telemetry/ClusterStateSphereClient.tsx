"use client";

import dynamic from "next/dynamic";
import type { ClusterSphereData } from "./sphereTypes";

const ClusterStateSphere = dynamic(() => import("./ClusterStateSphere"), {
  ssr: false,
  loading: () => (
    <div className="sphere-fallback">
      <div className="sphere-fallback-orb" />
      <span>Loading cluster telemetry…</span>
    </div>
  ),
});

type Props = {
  data: ClusterSphereData;
  projectorMode?: boolean;
};

export default function ClusterStateSphereClient(props: Props) {
  return <ClusterStateSphere {...props} />;
}
