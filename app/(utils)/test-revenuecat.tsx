import { revenueCatService } from "@/features/purchases/services/RevenueCatService";
import { COLORS } from "@/shared/constants/COLORS";
import HIT_SLOP_10 from "@/shared/constants/hitSlop";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

export default function TestRevenueCat() {
  const router = useRouter();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [activeEntitlements, setActiveEntitlements] = useState<string[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("free");
  const [isProductsAvailable, setIsProductsAvailable] =
    useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // Load initial data
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // Get customer info
      const info = await revenueCatService.getCustomerInfo();
      setCustomerInfo(info);

      // Get offerings
      const offer = await revenueCatService.getOfferings();
      setOfferings(offer);

      // Get active entitlements
      const entitlements = await revenueCatService.getActiveEntitlements();
      setActiveEntitlements(entitlements);

      // Check subscription status
      const status = await revenueCatService.checkSubscriptionStatus();
      setSubscriptionStatus(status);

      // Check if products are available
      const available = await revenueCatService.isProductsAvailable();
      setIsProductsAvailable(available);

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to load RevenueCat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAllData();

    // Set up listener for customer info updates
    const unsubscribe = revenueCatService.addCustomerInfoUpdateListener(
      (info: CustomerInfo) => {
        setCustomerInfo(info);
        setLastUpdate(new Date().toLocaleTimeString());
        GlobalErrorHandler.logDebug(
          "CustomerInfo updated via listener",
          "REVENUECAT_TEST",
          { info }
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefreshData = async () => {
    await loadAllData();
    Alert.alert("Success", "RevenueCat data refreshed!");
  };

  const handleGetCustomerInfo = async () => {
    setIsLoading(true);
    try {
      const info = await revenueCatService.getCustomerInfo();
      setCustomerInfo(info);
      Alert.alert(
        "Customer Info",
        info
          ? `User ID: ${info.originalAppUserId}\nEntitlements: ${Object.keys(info.entitlements.active).length}`
          : "No customer info available"
      );
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to get customer info");
      Alert.alert("Error", "Failed to get customer info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetOfferings = async () => {
    setIsLoading(true);
    try {
      const offer = await revenueCatService.getOfferings();
      setOfferings(offer);
      Alert.alert(
        "Offerings",
        offer
          ? `Available packages: ${offer.availablePackages.length}`
          : "No offerings available"
      );
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to get offerings");
      Alert.alert("Error", "Failed to get offerings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPurchase = async (pkg: PurchasesPackage) => {
    setIsLoading(true);
    try {
      const info = await revenueCatService.purchasePackage(pkg);
      if (info) {
        setCustomerInfo(info);
        Alert.alert("Success", "Purchase completed successfully!");
        await loadAllData(); // Refresh all data after purchase
      } else {
        Alert.alert("Cancelled", "Purchase was cancelled");
      }
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to purchase package");
      Alert.alert("Error", "Failed to complete purchase");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsLoading(true);
    try {
      const info = await revenueCatService.restorePurchases();
      if (info) {
        setCustomerInfo(info);
        Alert.alert("Success", "Purchases restored successfully!");
        await loadAllData(); // Refresh all data after restore
      } else {
        Alert.alert("Error", "Failed to restore purchases");
      }
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to restore purchases");
      Alert.alert("Error", "Failed to restore purchases");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckSubscriptionStatus = async () => {
    setIsLoading(true);
    try {
      const status = await revenueCatService.checkSubscriptionStatus();
      setSubscriptionStatus(status);
      Alert.alert("Subscription Status", `Current plan: ${status}`);
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to check subscription status");
      Alert.alert("Error", "Failed to check subscription status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckProductsAvailable = async () => {
    setIsLoading(true);
    try {
      const available = await revenueCatService.isProductsAvailable();
      setIsProductsAvailable(available);
      Alert.alert(
        "Products Availability",
        available ? "Products are available" : "No products available"
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "Failed to check products availability"
      );
      Alert.alert("Error", "Failed to check products availability");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetActiveEntitlements = async () => {
    setIsLoading(true);
    try {
      const entitlements = await revenueCatService.getActiveEntitlements();
      setActiveEntitlements(entitlements);
      Alert.alert(
        "Active Entitlements",
        entitlements.length > 0
          ? entitlements.join(", ")
          : "No active entitlements"
      );
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to get active entitlements");
      Alert.alert("Error", "Failed to get active entitlements");
    } finally {
      setIsLoading(false);
    }
  };

  const renderCustomerInfoCard = () => {
    if (!customerInfo) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No customer info available</Text>
        </View>
      );
    }

    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>👤 Customer Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User ID:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {customerInfo.originalAppUserId}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Request Date:</Text>
          <Text style={styles.infoValue}>
            {new Date(customerInfo.requestDate).toLocaleString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Active Entitlements:</Text>
          <Text style={styles.infoValue}>
            {Object.keys(customerInfo.entitlements.active).length}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Management URL:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {customerInfo.managementURL || "N/A"}
          </Text>
        </View>
      </View>
    );
  };

  const renderEntitlementsCard = () => {
    if (activeEntitlements.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No active entitlements</Text>
        </View>
      );
    }

    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🎫 Active Entitlements</Text>
        {activeEntitlements.map((entitlement, index) => (
          <View key={index} style={styles.entitlementItem}>
            <Text style={styles.entitlementText}>• {entitlement}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderOfferingsCard = () => {
    if (!offerings) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No offerings available
            {"\n"}
            (This is expected in development)
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          🛒 Offerings ({offerings.availablePackages.length})
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Identifier:</Text>
          <Text style={styles.infoValue}>{offerings.identifier}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Server Description:</Text>
          <Text style={styles.infoValue}>{offerings.serverDescription}</Text>
        </View>
        {offerings.availablePackages.length > 0 && (
          <View style={styles.packagesContainer}>
            <Text style={styles.packagesTitle}>Available Packages:</Text>
            {offerings.availablePackages.map((pkg, index) => (
              <View key={index} style={styles.packageItem}>
                <View style={styles.packageInfo}>
                  <Text style={styles.packageIdentifier}>{pkg.identifier}</Text>
                  <Text style={styles.packagePrice}>
                    {pkg.product.priceString}
                  </Text>
                  <Text style={styles.packageDescription}>
                    {pkg.product.description}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.purchaseButton}
                  onPress={() => handleTestPurchase(pkg)}
                  disabled={isLoading}
                  hitSlop={HIT_SLOP_10}
                >
                  <Text style={styles.purchaseButtonText}>Test Purchase</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderStatusCard = () => {
    return (
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>📊 Status</Text>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Subscription Plan:</Text>
          <Text style={[styles.statusValue, styles.planText]}>
            {subscriptionStatus}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Products Available:</Text>
          <Text style={styles.statusValue}>
            {isProductsAvailable ? "✅ Yes" : "❌ No"}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Last Update:</Text>
          <Text style={styles.statusValue}>{lastUpdate || "Never"}</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "RevenueCat Testing",
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/profile")}
              hitSlop={HIT_SLOP_10}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={[styles.backButton, styles.refreshButton]}
              onPress={handleRefreshData}
              disabled={isLoading}
              hitSlop={HIT_SLOP_10}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={[styles.backButtonText, styles.refreshButtonText]}>
                  🔄
                </Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Setup Guide Section */}
        {!isProductsAvailable && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Products Not Available</Text>
            <Text style={styles.warningText}>
              Products aren't loaded. This is expected if:{"\n"}• Products
              aren't approved in App Store Connect{"\n"}• No StoreKit
              Configuration file is set up{"\n"}
              {"\n"}
              <Text style={styles.warningTextBold}>Quick Fix (5 minutes):</Text>
              {"\n"}
              1.{" "}
              <Text style={styles.code}>
                cd ios && open Cadenceday.xcworkspace
              </Text>
              {"\n"}
              2. File → New → StoreKit Configuration File
              {"\n"}
              3. Add products matching RevenueCat Dashboard IDs
              {"\n"}
              4. Edit Scheme → Options → Select StoreKit file
              {"\n"}
              5. <Text style={styles.code}>npx expo run:ios</Text>
              {"\n"}
              {"\n"}
              📖 Full guide:{" "}
              <Text style={styles.code}>docs/revenuecat-testing/</Text>
            </Text>
            <TouchableOpacity
              style={styles.guideButton}
              onPress={() => {
                Alert.alert(
                  "Setup Guide",
                  "See the documentation at:\n\ndocs/revenuecat-testing/QUICK-REVENUECAT-SETUP.md\n\nThis file has complete step-by-step instructions for setting up StoreKit Configuration to test purchases before App Store approval.",
                  [{ text: "OK" }]
                );
              }}
              hitSlop={HIT_SLOP_10}
            >
              <Text style={styles.guideButtonText}>📖 View Setup Guide</Text>
            </TouchableOpacity>
          </View>
        )}

        {renderStatusCard()}
        {renderCustomerInfoCard()}
        {renderEntitlementsCard()}
        {renderOfferingsCard()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Query Operations</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleGetCustomerInfo}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Get Customer Info</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleGetOfferings}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Get Offerings</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleGetActiveEntitlements}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Get Active Entitlements</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonInfo]}
            onPress={handleCheckSubscriptionStatus}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Check Subscription Status</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonInfo]}
            onPress={handleCheckProductsAvailable}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Check Products Available</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Purchase Operations</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonWarning]}
            onPress={handleRestorePurchases}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Restore Purchases</Text>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText}>
              💡 To test a purchase, load offerings first, then tap "Test
              Purchase" on any available package above.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Live Updates</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText}>
              ✨ CustomerInfo updates are automatically streamed via listener.
              {"\n"}
              Last update: {lastUpdate || "Waiting for updates..."}
            </Text>
          </View>
        </View>

        {isLoading && (
          <View style={styles.processingIndicator}>
            <ActivityIndicator color="#007bff" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 12,
    borderRadius: 6,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  refreshButton: {
    marginLeft: 12,
  },
  refreshButtonText: {
    fontSize: 18,
    color: "#007AFF",
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  planText: {
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  button: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonPrimary: {
    backgroundColor: "#007bff",
  },
  buttonSecondary: {
    backgroundColor: "#6c757d",
  },
  buttonWarning: {
    backgroundColor: "#ffc107",
  },
  buttonInfo: {
    backgroundColor: "#17a2b8",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
  },
  entitlementItem: {
    paddingVertical: 4,
  },
  entitlementText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  packagesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  packagesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  packageItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  packageInfo: {
    marginBottom: 8,
  },
  packageIdentifier: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 12,
    color: "#666",
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  purchaseButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoBoxText: {
    fontSize: 13,
    color: "#1976d2",
    lineHeight: 20,
  },
  processingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    marginTop: 20,
  },
  processingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#007bff",
  },
  warningCard: {
    backgroundColor: "#fff3cd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#856404",
  },
  warningText: {
    fontSize: 13,
    color: "#856404",
    lineHeight: 20,
  },
  warningTextBold: {
    fontWeight: "bold",
    color: "#856404",
  },
  code: {
    fontFamily: "monospace",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 12,
  },
  guideButton: {
    backgroundColor: "#856404",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 12,
  },
  guideButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
