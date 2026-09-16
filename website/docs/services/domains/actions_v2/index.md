--- 
title: actions_v2
hide_title: false
hide_table_of_contents: false
keywords:
  - actions_v2
  - domains
  - godaddy
  - infrastructure-as-code
  - configuration-as-data
  - cloud inventory
description: Query, deploy and manage godaddy resources using SQL
custom_edit_url: null
image: /img/stackql-godaddy-provider-featured-image.png
---

import CopyableCode from '@site/src/components/CopyableCode/CopyableCode';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

GoDaddy Domains v2 API, scoped to a customer: customer_id is resolved from the GODADDY_CUSTOMER_ID environment variable when set, otherwise it is a required parameter (a WHERE value always wins). Accepts a Personal Access Token (Bearer) or a classic sso-key credential.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="actions_v2" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.domains.actions_v2" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="get">

Request was successful

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><CopyableCode code="request_id" /></td>
    <td><code>string</code></td>
    <td>A client provided identifier (via X-Request-Id header) used for tracking individual requests (wire: requestId)</td>
</tr>
<tr>
    <td><CopyableCode code="completed_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Timestamp indicating when the action was completed (wire: completedAt)</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Timestamp indicating when the action was created (wire: createdAt)</td>
</tr>
<tr>
    <td><CopyableCode code="modified_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Timestamp indicating when the action was last modified (wire: modifiedAt)</td>
</tr>
<tr>
    <td><CopyableCode code="origination" /></td>
    <td><code>string</code></td>
    <td>The origination of the action  - **USER** — These are user requests. - **SYSTEM** — These are system processing actions. (USER, SYSTEM)</td>
</tr>
<tr>
    <td><CopyableCode code="reason" /></td>
    <td><code>object</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="started_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Timestamp indicating when the action was started (wire: startedAt)</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>The current status of the action  - **ACCEPTED** — The action has been queued; processing has not started. - **AWAITING** — The action is waiting on user input. - **CANCELLED** — The action has been cancelled by the user. - **FAILED** — An error occurred while the action was processing; no more processing will be performed. - **PENDING** — The action is being processed. - **SUCCESS** — The action has completed; no additional processing is required. (ACCEPTED, AWAITING, CANCELLED, FAILED, PENDING, SUCCESS) (default: ACCEPTED)</td>
</tr>
<tr>
    <td><CopyableCode code="type" /></td>
    <td><code>string</code></td>
    <td>The type of action being performed  - **AUTH_CODE_PURCHASE** — Request for an auth code for a .de domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/purchaseAuthCode. - **AUTH_CODE_REGENERATE** — Request to regenerate the authCode for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/regenerateAuthCode - **AUTO_RENEWAL** — A Domain Auto Renew is in progress. - **BACKORDER_PURCHASE** — Request to purchase a domain backorder via POST /v2/customers/&#123;customerId&#125;/domains/backorders/purchase. - **BACKORDER_DELETE** — Request to cancel the current domain backorder via DELETE /v2/customers/&#123;customerId&#125;/domains/backorders/&#123;domain&#125;. - **BACKORDER_UPDATE** — Request update the current domain backorder via PATCH /v2/customers/&#123;customerId&#125;/domains/backorders/&#123;domain&#125;. - **CHANGE_OF_REGISTRANT_DELETE** — Request to delete a change of registrant request via DELETE /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/changeOfRegistrant. - **CONTACT_CREATE** — Request to create a contact via POST /v2/customers/&#123;customerId&#125;/domains/contacts. - **CONTACT_DELETE** — Request to delete a contact via DELETE /v2/customers/&#123;customerId&#125;/domains/contacts/&#123;contactId&#125; - **CONTACT_UPDATE** — Request to update a contact via PATCH /v2/customers/&#123;customerId&#125;/domains/contacts/&#123;contactId&#125; - **DNS_VERIFICATION** — Domain requires zone file setup. - **DNSSEC_CREATE** — Request to create DNSSEC record for the domain via PATCH /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/dnssecRecords. - **DNSSEC_DELETE** — Request to delete DNSSEC record for the domain via DELETE /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/dnssecRecords. - **DOMAIN_DELETE** — Request to delete the domain via DELETE /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125; - **DOMAIN_UPDATE** — Request to update the domain via PATCH /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125; - **DOMAIN_UPDATE_CONTACTS** — Request to update the domain contacts via PATCH /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/contacts - **DOMAIN_UPDATE_NAME_SERVERS** — Request to update the domain name servers via PUT /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/nameServers - **EXPIRY** — A Domain Expiration is in progress. - **HOST_CREATE** — Request to create a hostname via PUT /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/hosts/&#123;hostname&#125; - **HOST_DELETE** — Request to delete a hostname via DELETE /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/hosts/&#123;hostname&#125; - **ICANN_VERIFICATION** — Domain requires registrant verification for ICANN. - **PREMIUM** — Premium Domain domain sale is in progress. - **PRIVACY_FORWARDING_UPDATE** — Request to update privacy forwarding information via PATCH /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/privacy/forwarding. - **PRIVACY_PURCHASE** — Request to purchase privacy for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/privacy/purchase - **PRIVACY_DELETE** — Request to remove privacy from a domain via DELETE /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/privacy - **REDEEM** — Request to redeem a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/redeem - **REGISTER** — Request to register a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/register - **RENEW** — Request to renew a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/renew - **RENEW_UNDO** — Request to undo a renewal for a uk domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/undoRenew - **TRADE** — A domain trade request is in progress - **TRADE_CANCEL** — Request to cancel a trade for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/tradeCancel - **TRADE_PURCHASE** — Request to purchase a trade for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/tradePurchase - **TRADE_PURCHASE_AUTH_TEXT_MESSAGE** — Request for a trade purchase text message for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/tradePurchaseAuthorizationTextMessage - **TRADE_RESEND_AUTH_EMAIL** — Request to resend the trade auth email message for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/tradeResendAuthorizationEmail - **TRANSFER** — Request to transfer a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transfer - **TRANSFER_IN** — A domain transfer in request is in progress. - **TRANSFER_IN_ACCEPT** — Request to accept a domain transfer in via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferInAccept - **TRANSFER_IN_CANCEL** — Request to cancel a domain transfer via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferInCancel - **TRANSFER_IN_RESTART** — Request to restart a domain transfer in via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferInRestart - **TRANSFER_IN_RETRY** — Request to retry a domain transfer in via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferInRetry - **TRANSFER_OUT** — A domain transfer out request is in progress. - **TRANSFER_OUT_ACCEPT** — Request to accept a transfer out request for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferOutAccept - **TRANSFER_OUT_REJECT** — Request to reject a transfer out request for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferOutReject - **TRANSFER_OUT_REQUESTED** — Request to transfer out for a domain (.de) via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferOut - **TRANSIT** — Request to transit a de or at domain at the registry via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transit (AUTH_CODE_PURCHASE, AUTH_CODE_REGENERATE, AUTO_RENEWAL, BACKORDER_PURCHASE, BACKORDER_DELETE, BACKORDER_UPDATE, CHANGE_OF_REGISTRANT_DELETE, CONTACT_CREATE, CONTACT_DELETE, CONTACT_UPDATE, DNS_VERIFICATION, DNSSEC_CREATE, DNSSEC_DELETE, DOMAIN_DELETE, DOMAIN_UPDATE, DOMAIN_UPDATE_CONTACTS, DOMAIN_UPDATE_NAME_SERVERS, EXPIRY, HOST_CREATE, HOST_DELETE, ICANN_VERIFICATION, MIGRATE, MIGRATE_IN, PREMIUM, PRIVACY_PURCHASE, PRIVACY_DELETE, REDEEM, REGISTER, RENEW, RENEW_UNDO, TRADE, TRADE_CANCEL, TRADE_PURCHASE, TRADE_PURCHASE_AUTH_TEXT_MESSAGE, TRADE_RESEND_AUTH_EMAIL, TRANSFER, TRANSFER_IN, TRANSFER_IN_ACCEPT, TRANSFER_IN_CANCEL, TRANSFER_IN_RESTART, TRANSFER_IN_RETRY, TRANSFER_OUT, TRANSFER_OUT_ACCEPT, TRANSFER_OUT_REJECT, TRANSFER_OUT_REQUESTED, TRANSIT)</td>
</tr>
</tbody>
</table>
</TabItem>
<TabItem value="list">

Request was successful

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><CopyableCode code="request_id" /></td>
    <td><code>string</code></td>
    <td>A client provided identifier (via X-Request-Id header) used for tracking individual requests (wire: requestId)</td>
</tr>
<tr>
    <td><CopyableCode code="completed_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Timestamp indicating when the action was completed (wire: completedAt)</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Timestamp indicating when the action was created (wire: createdAt)</td>
</tr>
<tr>
    <td><CopyableCode code="modified_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Timestamp indicating when the action was last modified (wire: modifiedAt)</td>
</tr>
<tr>
    <td><CopyableCode code="origination" /></td>
    <td><code>string</code></td>
    <td>The origination of the action  - **USER** — These are user requests. - **SYSTEM** — These are system processing actions. (USER, SYSTEM)</td>
</tr>
<tr>
    <td><CopyableCode code="reason" /></td>
    <td><code>object</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="started_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Timestamp indicating when the action was started (wire: startedAt)</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>The current status of the action  - **ACCEPTED** — The action has been queued; processing has not started. - **AWAITING** — The action is waiting on user input. - **CANCELLED** — The action has been cancelled by the user. - **FAILED** — An error occurred while the action was processing; no more processing will be performed. - **PENDING** — The action is being processed. - **SUCCESS** — The action has completed; no additional processing is required. (ACCEPTED, AWAITING, CANCELLED, FAILED, PENDING, SUCCESS) (default: ACCEPTED)</td>
</tr>
<tr>
    <td><CopyableCode code="type" /></td>
    <td><code>string</code></td>
    <td>The type of action being performed  - **AUTH_CODE_PURCHASE** — Request for an auth code for a .de domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/purchaseAuthCode. - **AUTH_CODE_REGENERATE** — Request to regenerate the authCode for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/regenerateAuthCode - **AUTO_RENEWAL** — A Domain Auto Renew is in progress. - **BACKORDER_PURCHASE** — Request to purchase a domain backorder via POST /v2/customers/&#123;customerId&#125;/domains/backorders/purchase. - **BACKORDER_DELETE** — Request to cancel the current domain backorder via DELETE /v2/customers/&#123;customerId&#125;/domains/backorders/&#123;domain&#125;. - **BACKORDER_UPDATE** — Request update the current domain backorder via PATCH /v2/customers/&#123;customerId&#125;/domains/backorders/&#123;domain&#125;. - **CHANGE_OF_REGISTRANT_DELETE** — Request to delete a change of registrant request via DELETE /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/changeOfRegistrant. - **CONTACT_CREATE** — Request to create a contact via POST /v2/customers/&#123;customerId&#125;/domains/contacts. - **CONTACT_DELETE** — Request to delete a contact via DELETE /v2/customers/&#123;customerId&#125;/domains/contacts/&#123;contactId&#125; - **CONTACT_UPDATE** — Request to update a contact via PATCH /v2/customers/&#123;customerId&#125;/domains/contacts/&#123;contactId&#125; - **DNS_VERIFICATION** — Domain requires zone file setup. - **DNSSEC_CREATE** — Request to create DNSSEC record for the domain via PATCH /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/dnssecRecords. - **DNSSEC_DELETE** — Request to delete DNSSEC record for the domain via DELETE /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/dnssecRecords. - **DOMAIN_DELETE** — Request to delete the domain via DELETE /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125; - **DOMAIN_UPDATE** — Request to update the domain via PATCH /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125; - **DOMAIN_UPDATE_CONTACTS** — Request to update the domain contacts via PATCH /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/contacts - **DOMAIN_UPDATE_NAME_SERVERS** — Request to update the domain name servers via PUT /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/nameServers - **EXPIRY** — A Domain Expiration is in progress. - **HOST_CREATE** — Request to create a hostname via PUT /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/hosts/&#123;hostname&#125; - **HOST_DELETE** — Request to delete a hostname via DELETE /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/hosts/&#123;hostname&#125; - **ICANN_VERIFICATION** — Domain requires registrant verification for ICANN. - **PREMIUM** — Premium Domain domain sale is in progress. - **PRIVACY_FORWARDING_UPDATE** — Request to update privacy forwarding information via PATCH /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/privacy/forwarding. - **PRIVACY_PURCHASE** — Request to purchase privacy for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/privacy/purchase - **PRIVACY_DELETE** — Request to remove privacy from a domain via DELETE /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/privacy - **REDEEM** — Request to redeem a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/redeem - **REGISTER** — Request to register a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/register - **RENEW** — Request to renew a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/renew - **RENEW_UNDO** — Request to undo a renewal for a uk domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/undoRenew - **TRADE** — A domain trade request is in progress - **TRADE_CANCEL** — Request to cancel a trade for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/tradeCancel - **TRADE_PURCHASE** — Request to purchase a trade for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/tradePurchase - **TRADE_PURCHASE_AUTH_TEXT_MESSAGE** — Request for a trade purchase text message for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/tradePurchaseAuthorizationTextMessage - **TRADE_RESEND_AUTH_EMAIL** — Request to resend the trade auth email message for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/tradeResendAuthorizationEmail - **TRANSFER** — Request to transfer a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transfer - **TRANSFER_IN** — A domain transfer in request is in progress. - **TRANSFER_IN_ACCEPT** — Request to accept a domain transfer in via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferInAccept - **TRANSFER_IN_CANCEL** — Request to cancel a domain transfer via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferInCancel - **TRANSFER_IN_RESTART** — Request to restart a domain transfer in via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferInRestart - **TRANSFER_IN_RETRY** — Request to retry a domain transfer in via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferInRetry - **TRANSFER_OUT** — A domain transfer out request is in progress. - **TRANSFER_OUT_ACCEPT** — Request to accept a transfer out request for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferOutAccept - **TRANSFER_OUT_REJECT** — Request to reject a transfer out request for a domain via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferOutReject - **TRANSFER_OUT_REQUESTED** — Request to transfer out for a domain (.de) via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transferOut - **TRANSIT** — Request to transit a de or at domain at the registry via POST /v2/customers/&#123;customerId&#125;/domains/&#123;domain&#125;/transit (AUTH_CODE_PURCHASE, AUTH_CODE_REGENERATE, AUTO_RENEWAL, BACKORDER_PURCHASE, BACKORDER_DELETE, BACKORDER_UPDATE, CHANGE_OF_REGISTRANT_DELETE, CONTACT_CREATE, CONTACT_DELETE, CONTACT_UPDATE, DNS_VERIFICATION, DNSSEC_CREATE, DNSSEC_DELETE, DOMAIN_DELETE, DOMAIN_UPDATE, DOMAIN_UPDATE_CONTACTS, DOMAIN_UPDATE_NAME_SERVERS, EXPIRY, HOST_CREATE, HOST_DELETE, ICANN_VERIFICATION, MIGRATE, MIGRATE_IN, PREMIUM, PRIVACY_PURCHASE, PRIVACY_DELETE, REDEEM, REGISTER, RENEW, RENEW_UNDO, TRADE, TRADE_CANCEL, TRADE_PURCHASE, TRADE_PURCHASE_AUTH_TEXT_MESSAGE, TRADE_RESEND_AUTH_EMAIL, TRANSFER, TRANSFER_IN, TRANSFER_IN_ACCEPT, TRANSFER_IN_CANCEL, TRANSFER_IN_RESTART, TRANSFER_IN_RETRY, TRANSFER_OUT, TRANSFER_OUT_ACCEPT, TRANSFER_OUT_REJECT, TRANSFER_OUT_REQUESTED, TRANSIT)</td>
</tr>
</tbody>
</table>
</TabItem>
</Tabs>

## Methods

The following methods are available for this resource:

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Accessible by</th>
    <th>Required Params</th>
    <th>Optional Params</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><a href="#get"><CopyableCode code="get" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-type"><code>type</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Returns the most recent action of the specified type including status, timestamps, and any error details.</td>
</tr>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Returns a paginated list of recent actions for the domain. Use to track long-running operations or audit domain history.</td>
</tr>
<tr>
    <td><a href="#cancel"><CopyableCode code="cancel" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-type"><code>type</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Cancels the most recent user-initiated action if it is still in a cancellable state. Returns 202 Accepted.</td>
</tr>
</tbody>
</table>

## Parameters

Parameters can be passed in the `WHERE` clause of a query. Check the [Methods](#methods) section to see which parameters are required or optional for each operation.

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr id="parameter-customer_id">
    <td><CopyableCode code="customer_id" /></td>
    <td><code>string (uuid)</code></td>
    <td>GoDaddy customer identifier (UUID, not the numeric shopper number). Resolved from the <code>GODADDY_CUSTOMER_ID</code> environment variable when it is set (server variable, x-stackQL-envVar); otherwise required on every method of this resource. A WHERE value always takes precedence over the environment. API resellers acting on behalf of a subaccount pass the subaccount customer identifier.</td>
</tr>
<tr id="parameter-domain">
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>Domain whose action is to be cancelled</td>
</tr>
<tr id="parameter-type">
    <td><CopyableCode code="type" /></td>
    <td><code>string</code></td>
    <td>The type of action to cancel</td>
</tr>
<tr id="parameter-x_request_id">
    <td><CopyableCode code="x_request_id" /></td>
    <td><code>string</code></td>
    <td>A client provided identifier for tracking this request. (wire: X-Request-Id)</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="get">

Returns the most recent action of the specified type including status, timestamps, and any error details.

```sql
SELECT
request_id,
completed_at,
created_at,
modified_at,
origination,
reason,
started_at,
status,
type
FROM godaddy.domains.actions_v2
WHERE domain = '{{ domain }}' -- required
AND customer_id = '{{ customer_id }}' -- required unless GODADDY_CUSTOMER_ID is set
AND type = '{{ type }}' -- required
AND x_request_id = '{{ x_request_id }}'
;
```
</TabItem>
<TabItem value="list">

Returns a paginated list of recent actions for the domain. Use to track long-running operations or audit domain history.

```sql
SELECT
request_id,
completed_at,
created_at,
modified_at,
origination,
reason,
started_at,
status,
type
FROM godaddy.domains.actions_v2
WHERE domain = '{{ domain }}' -- required
AND customer_id = '{{ customer_id }}' -- required unless GODADDY_CUSTOMER_ID is set
AND x_request_id = '{{ x_request_id }}'
;
```
</TabItem>
</Tabs>


## `DELETE` examples

<Tabs
    defaultValue="cancel"
    values={[
        { label: 'cancel', value: 'cancel' }
    ]}
>
<TabItem value="cancel">

Cancels the most recent user-initiated action if it is still in a cancellable state. Returns 202 Accepted.

```sql
DELETE FROM godaddy.domains.actions_v2
WHERE domain = '{{ domain }}' --required
AND customer_id = '{{ customer_id }}' -- required unless GODADDY_CUSTOMER_ID is set
AND type = '{{ type }}' --required
AND x_request_id = '{{ x_request_id }}'
;
```
</TabItem>
</Tabs>
