import type { ReactNode } from "react";
import styles from "./styles.module.css";

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.imageContainer}>
          <img 
            src="/img/docs-homepage.png" 
            alt="Cadence app screenshots showing visual time-tracking, weekly patterns, notes, and encryption features"
            className={styles.featuresImage}
          />
        </div>
      </div>
    </section>
  );
}
