import { Analytics } from "@vercel/analytics/react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <>
      <Analytics />
      <header className={clsx("hero", styles.heroBanner)}>
        <div className="container">
          <Heading as="h1" className="hero__title">
            Cadence Docs
          </Heading>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.heroImage}>
            <img
              src="/img/docs-homepage.png"
              alt="Cadence Logo"
              className={styles.heroLogo}
            />
          </div>
        </div>
      </header>
    </>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Cadence Docs"
      description="Track your time, understand your rhythms, live intentionally"
    >
      <HomepageHeader />
    </Layout>
  );
}
