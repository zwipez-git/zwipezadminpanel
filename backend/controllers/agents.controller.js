import pool from '../db/db.js';

export const acceptOrder = async (req, res) => {
  const { orderId, agentId } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    //locks orders
    const orderResult = await client.query(
      "SELECT * FROM orders WHERE id = $1 FOR UPDATE",
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      throw new Error("Order not found");
    }

    const order = orderResult.rows[0];

    // check if assigned
    if (order.status !== "CREATED") {
      throw new Error("Order already taken");
    }

    //  Assign order
    await client.query(
      "UPDATE orders SET status = 'ASSIGNED' WHERE id = $1",
      [orderId]
    );

    // Update agent
    await client.query(
      "UPDATE agents SET current_order = $1 WHERE agent_id = $2",
      [orderId, agentId]
    );

    await client.query("COMMIT");

    res.json({ success: true, message: "Order assigned" });

  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};



export const updateStatus = async (req, res) => {
  const { orderId, status } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get order
    const result = await client.query(
      "SELECT * FROM orders WHERE id = $1 FOR UPDATE",
      [orderId]
    );

    if (!result.rows.length) {
      throw new Error("Order not found");
    }

    const order = result.rows[0];

    // Validate status flow
    const validFlow = {
      ASSIGNED: "PICKED_UP",
      PICKED_UP: "OUT_FOR_DELIVERY",
      OUT_FOR_DELIVERY: "DELIVERED"
    };

    if (validFlow[order.status] !== status) {
      throw new Error(`Invalid status transition from ${order.status} to ${status}`);
    }

    //  Update order status
    await client.query(
      "UPDATE orders SET status = $1 WHERE id = $2",
      [status, orderId]
    );

    if (status === "DELIVERED") {
      await client.query(
        "UPDATE agents SET current_order = NULL WHERE current_order = $1",
        [orderId]
      );
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: `Order status updated to ${status}`
    });

  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};