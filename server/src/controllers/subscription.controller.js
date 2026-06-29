import User from "../models/User.js";
import { REVENUECAT_WEBHOOK_AUTH } from "../config/env.js";
import { Errors } from "../utils/AppError.js";
import {
  isUserPro,
  getProSource,
  trialDaysLeft,
} from "../services/proAccess.js";

const PLAN_BY_PRODUCT = {
  crosspost_pro_monthly: "monthly",
  crosspost_pro_6month: "6month",
  crosspost_pro_yearly: "yearly",
};

const ACTIVATING_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
  "SUBSCRIPTION_EXTENDED",
  "NON_RENEWING_PURCHASE",
]);

const DEACTIVATING_EVENTS = new Set(["EXPIRATION", "BILLING_ISSUE"]);

export async function revenuecatWebhook(req, res) {
  if (REVENUECAT_WEBHOOK_AUTH) {
    if (req.headers.authorization !== REVENUECAT_WEBHOOK_AUTH) {
      throw Errors.unauthorized("Invalid webhook authorization");
    }
  }

  const event = req.body?.event;
  if (!event) {
    return res.json({ success: true });
  }

  const user = await User.findById(event.app_user_id).catch(() => null);
  if (!user) {
    return res.json({ success: true });
  }

  const productId = event.product_id || null;
  const expiresAt = event.expiration_at_ms
    ? new Date(event.expiration_at_ms)
    : null;

  if (ACTIVATING_EVENTS.has(event.type)) {
    user.subscription = {
      isPro: true,
      plan: PLAN_BY_PRODUCT[productId] || user.subscription?.plan || null,
      store: "app_store",
      productId,
      expiresAt,
      willRenew: true,
      originalTransactionId:
        event.original_transaction_id ||
        user.subscription?.originalTransactionId ||
        null,
      updatedAt: new Date(),
    };
  } else if (event.type === "CANCELLATION") {
    if (user.subscription) {
      user.subscription.willRenew = false;
      user.subscription.updatedAt = new Date();
    }
  } else if (DEACTIVATING_EVENTS.has(event.type)) {
    if (user.subscription) {
      user.subscription.isPro = false;
      user.subscription.willRenew = false;
      user.subscription.updatedAt = new Date();
    }
  }

  await user.save();
  res.json({ success: true });
}

export async function getSubscriptionStatus(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw Errors.notFound("User not found");
  }

  res.json({
    success: true,
    data: {
      isPro: isUserPro(user),
      proSource: getProSource(user),
      trialDaysLeft: trialDaysLeft(user),
      subscription: user.subscription || null,
    },
  });
}
