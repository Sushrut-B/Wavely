import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { Contact, Message, Organization } from '../database/models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKFLOW_FILE_PATH = path.join(__dirname, '../database/demo1_workflow.json');

const DEFAULT_TRIGGER_MESSAGE = "Namaskara! 🙏 This is the official automated channel of MLA Dr. Ramesh Gowda for Bengaluru, Karnataka. \n\nWe want to ensure your voice is heard! Reply with the number of the service you need:\n\n1️⃣ Know Your MLA & Report Card\n2️⃣ Electricity Issues (BESCOM)\n3️⃣ Water Supply/Sewage (BWSSB)\n4️⃣ Emergency Helpline Contacts\n5️⃣ Roads, Potholes & BBMP Grievances\n6️⃣ Free Healthcare & Namma Clinics\n7️⃣ Direct Grievance Registration";

const DEFAULT_WORKFLOW = {
  trigger: {
    message: DEFAULT_TRIGGER_MESSAGE
  },
  options: {
    "1": {
      "title": "About Dr. Ramesh Gowda",
      "reply": "Choose an option to know more:\n\n1.1️⃣ Dr. Ramesh Gowda's Education & Career\n1.2️⃣ Ward Development Work (2020-2026)\n1.3️⃣ Locate Campaign Office Address\n1.4️⃣ Back to Main Menu"
    },
    "1.1": {
      "title": "MLA Biography",
      "reply": "Biography:\nDr. Ramesh Gowda holds an MBBS from Bangalore Medical College and a Master's in Public Policy from Harvard University. He worked as a public health policy director for 15 years before entering public service."
    },
    "1.2": {
      "title": "Development Work",
      "reply": "Notable Ward Projects (2020-2026):\n- 50+ Namma Clinics established (Free healthcare)\n- 120km of roads resurfaced and pothole-free\n- 4 public parks renovated with walking tracks\n- 3 government schools upgraded with digital labs."
    },
    "1.3": {
      "title": "Campaign Office",
      "reply": "Campaign Office Address:\nNo. 42, 8th Cross Road, Malleshwaram, Bengaluru - 560003.\nGoogle Maps Link: https://maps.google.com/mla-office\nOpen hours: 9:00 AM - 8:00 PM daily."
    },
    "1.4": {
      "title": "Back to Main Menu",
      "reply": DEFAULT_TRIGGER_MESSAGE
    },

    "2": {
      "title": "Electricity Issues (BESCOM)",
      "reply": "For BESCOM issues, please select an option:\n\n2.1️⃣ Report a Power Outage\n2.2️⃣ Billing & Meter Issues\n2.3️⃣ Speak to a Campaign Agent\n2.4️⃣ Back to Main Menu"
    },
    "2.1": {
      "title": "Report Power Outage",
      "reply": "Please reply with your 10-digit BESCOM Account ID (e.g. 1029384756) to log the power outage directly on our system."
    },
    "2.2": {
      "title": "Billing & Meter Issues",
      "reply": "For billing disputes or meter defects under BESCOM:\n- Call billing helpline: 080-22441912\n- File a billing dispute ticket: https://bescom.co.in/billing\n- Our ward desk can escalate billing errors. Reply with your complaint details."
    },
    "2.3": {
      "title": "Speak to Ward Representative",
      "reply": "Transferring your chat to the Ward 4 Campaign Representative. Please hold..."
    },
    "2.4": {
      "title": "Back to Main Menu",
      "reply": DEFAULT_TRIGGER_MESSAGE
    },

    "3": {
      "title": "Water Supply/Sewage (BWSSB)",
      "reply": "For BWSSB water or sewage issues, please select:\n\n3.1️⃣ Report a Water Pipe Leakage\n3.2️⃣ Book a Subsidized Water Tanker\n3.3️⃣ Sewage Blockage/Overflow\n3.4️⃣ Back to Main Menu"
    },
    "3.1": {
      "title": "Report Water Leakage",
      "reply": "To report a water leakage, please reply with the street name and nearest landmark. You can also upload a photo on our portal: https://bwssb.karnataka.gov.in/leak"
    },
    "3.2": {
      "title": "Subsidized Water Tanker",
      "reply": "Water tanker booking portal:\nDr. Ramesh Gowda's desk provides subsidized BWSSB water tankers to water-scarce blocks. Please enter your BWSSB connection ID or reply with your street address to book."
    },
    "3.3": {
      "title": "Sewage Blockage",
      "reply": "For sewage overflow or blocked drains:\n- Call BWSSB helpline: 1916\n- A cleaning crew is active in Ward 4. Reply with the street name to dispatch the jetting machine."
    },
    "3.4": {
      "title": "Back to Main Menu",
      "reply": DEFAULT_TRIGGER_MESSAGE
    },

    "4": {
      "title": "Emergency Helplines",
      "reply": "Select emergency category:\n\n4.1️⃣ Medical Emergency (Ambulance)\n4.2️⃣ Police Control Room\n4.3️⃣ Fire & Safety Desk\n4.4️⃣ Back to Main Menu"
    },
    "4.1": {
      "title": "Medical Emergency",
      "reply": "🚨 Medical Emergency:\n- State Ambulance: Call 108\n- Local Namma Clinic ambulance cell: 080-25678910\n- KC General Hospital (Nearest): 080-23340011"
    },
    "4.2": {
      "title": "Police Control Room",
      "reply": "👮 Police Emergencies:\n- Police Helpline: 112\n- Local Police Station (Malleshwaram): 080-22942513\n- Dr. Ramesh Gowda's Women Safety Cell: 9880198801"
    },
    "4.3": {
      "title": "Fire & Safety",
      "reply": "🔥 Fire Control:\n- Fire Helpline: 101\n- High Ground Fire Station: 080-22971500"
    },
    "4.4": {
      "title": "Back to Main Menu",
      "reply": DEFAULT_TRIGGER_MESSAGE
    },

    "5": {
      "title": "Roads & BBMP Grievances",
      "reply": "For local infrastructure issues, please select:\n\n5.1️⃣ Report a Pothole\n5.2️⃣ Streetlight Failure\n5.3️⃣ Solid Waste/Garbage pile\n5.4️⃣ Back to Main Menu"
    },
    "5.1": {
      "title": "Report a Pothole",
      "reply": "Please describe the pothole location in our ward. We log pothole complaints directly with the BBMP ward engineers. We aim to repair within 48 hours."
    },
    "5.2": {
      "title": "Streetlight Failure",
      "reply": "To report a streetlight failure, please reply with the nearest building address or the pole ID. Repair SLA is 48 hours."
    },
    "5.3": {
      "title": "Garbage Clearance",
      "reply": "For missed garbage pickup or illegal dumping: Reply with the block details. The ward auto-tipper supervisor will be notified."
    },
    "5.4": {
      "title": "Back to Main Menu",
      "reply": DEFAULT_TRIGGER_MESSAGE
    },

    "6": {
      "title": "Health & Education Initiatives",
      "reply": "Select initiative details:\n\n6.1️⃣ Locate Nearest 'Namma Clinic'\n6.2️⃣ Free Health Camp Schedule\n6.3️⃣ Govt School Upgrade status\n6.4️⃣ Back to Main Menu"
    },
    "6.1": {
      "title": "Namma Clinic Locations",
      "reply": "🏥 Namma Clinic (Ward 4):\nOpen: 9:00 AM - 4:00 PM (Mon-Sat)\nLocation: Ward Office Compound, 4th Main road.\nServices: Free doctor consultations, basic diagnostics, and medicines."
    },
    "6.2": {
      "title": "Free Health Camp",
      "reply": "🏥 Next Medical Camp:\nDate: Saturday, Aug 22\nTime: 9:00 AM - 1:00 PM\nLocation: Ward 4 Community Center\nServices: Free eye checks, cardiology screening, and free distribution of prescribed medicines."
    },
    "6.3": {
      "title": "School Upgrades",
      "reply": "🎓 School Modernization:\nDr. Ramesh Gowda's education desk has upgraded 3 local government primary schools with smart-boards, computer classrooms, and renovated playgrounds."
    },
    "6.4": {
      "title": "Back to Main Menu",
      "reply": DEFAULT_TRIGGER_MESSAGE
    },

    "7": {
      "title": "Direct Grievance Desk",
      "reply": "Choose options:\n\n7.1️⃣ Register General Grievance\n7.2️⃣ Check Grievance Status\n7.3️⃣ Back to Main Menu"
    },
    "7.1": {
      "title": "Register Complaint",
      "reply": "We have enabled direct grievance logging. Please describe your grievance. Begin your reply with the word 'GRIEVANCE' followed by your issue description."
    },
    "7.2": {
      "title": "Check Complaint Status",
      "reply": "To check your grievance status, please enter your 6-digit Grievance Tracker ID (e.g. GR-123456)."
    },
    "7.3": {
      "title": "Back to Main Menu",
      "reply": DEFAULT_TRIGGER_MESSAGE
    }
  }
};

// Helper to get active workflow
const getWorkflow = () => {
  try {
    if (fs.existsSync(WORKFLOW_FILE_PATH)) {
      const data = fs.readFileSync(WORKFLOW_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading workflow file:', error.message);
  }
  return DEFAULT_WORKFLOW;
};

// Helper to save workflow
const saveWorkflow = (workflow) => {
  try {
    const dir = path.dirname(WORKFLOW_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(WORKFLOW_FILE_PATH, JSON.stringify(workflow, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving workflow file:', error.message);
    return false;
  }
};

router.get('/workflow', (req, res) => {
  res.json(getWorkflow());
});

router.post('/workflow', (req, res) => {
  const workflow = req.body;
  if (!workflow || !workflow.trigger || !workflow.options) {
    return res.status(400).json({ error: 'Invalid workflow configuration format' });
  }

  const success = saveWorkflow(workflow);
  if (success) {
    res.json({ success: true, message: 'Workflow saved successfully', workflow });
  } else {
    res.status(500).json({ error: 'Failed to save workflow config' });
  }
});

router.post('/send', async (req, res) => {
  try {
    let org = await Organization.findOne();
    if (!org) {
      org = await Organization.create({ id: uuid(), name: 'Karnataka MLA Campaign Org' });
    }

    let contacts = await Contact.findAll({ where: { organizationId: org.id } });
    if (contacts.length === 0) {
      const mockContacts = [
        { id: uuid(), organizationId: org.id, name: 'Ramesh Gowda', phoneNumber: '+919876543210', email: 'ramesh.gowda@gmail.com' },
        { id: uuid(), organizationId: org.id, name: 'Savitri Devi', phoneNumber: '+919876543211', email: 'savitri.d@yahoo.com' },
        { id: uuid(), organizationId: org.id, name: 'Deepak Rao', phoneNumber: '+919876543212', email: 'deepak.rao@gmail.com' },
        { id: uuid(), organizationId: org.id, name: 'Ananya Hegde', phoneNumber: '+919876543213', email: 'ananya.h@outlook.com' },
        { id: uuid(), organizationId: org.id, name: 'Suresh Kumar', phoneNumber: '+919876543214', email: 'suresh.k@gmail.com' },
      ];
      contacts = await Contact.bulkCreate(mockContacts);
    }

    const workflow = getWorkflow();
    const triggerMessage = workflow.trigger.message;
    const messagesToCreate = [];
    const now = new Date();

    for (const contact of contacts) {
      messagesToCreate.push({
        id: uuid(),
        organizationId: org.id,
        contactId: contact.id,
        whatsappMessageId: `msg-${uuid()}`,
        messageType: 'text',
        content: triggerMessage,
        direction: 'outbound',
        status: 'delivered',
        senderType: 'bot',
        createdAt: now,
        updatedAt: now,
      });

      await contact.update({
        lastMessageAt: now,
        conversationActive: true,
      });
    }

    await Message.bulkCreate(messagesToCreate);

    res.json({
      success: true,
      message: `Broadcast successfully simulated for ${contacts.length} contacts!`,
      contactsCount: contacts.length,
      broadcastMessage: triggerMessage,
    });
  } catch (error) {
    console.error('Error simulating campaign send:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get recent logged grievances from DB messages
 */
router.get('/grievances', async (req, res) => {
  try {
    let org = await Organization.findOne();
    if (!org) {
      org = await Organization.create({ id: uuid(), name: 'Karnataka MLA Campaign Org' });
    }

    // Query outbound bot messages that contain a Grievance tracker ID
    const messages = await Message.findAll({
      where: {
        organizationId: org.id,
        direction: 'outbound',
        senderType: 'bot',
      },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    const grievances = [];
    const grRegex = /GR-\d{6}/;
    const tnkRegex = /TNK-\d{6}/;

    for (const msg of messages) {
      const matchGr = msg.content.match(grRegex);
      const matchTnk = msg.content.match(tnkRegex);
      
      if (matchGr || matchTnk) {
        const ticketId = matchGr ? matchGr[0] : matchTnk[0];
        
        // Find matching inbound user message logged right before to extract location
        const userMsg = await Message.findOne({
          where: {
            organizationId: org.id,
            contactId: msg.contactId,
            direction: 'inbound',
            createdAt: {
              [Op.lte]: msg.createdAt
            }
          },
          order: [['createdAt', 'DESC']]
        });

        // Determine issue type
        let type = 'General Grievance';
        if (msg.content.includes('streetlight')) type = 'Streetlight Repair';
        else if (msg.content.includes('Pothole')) type = 'Pothole Patching';
        else if (msg.content.includes('garbage')) type = 'Garbage Clearance';
        else if (msg.content.includes('Water Tanker')) type = 'Water Tanker Booking';
        else if (msg.content.includes('leakage')) type = 'Water Pipe Leakage';
        else if (msg.content.includes('Sewage')) type = 'Sewage Jetting';

        const location = userMsg ? userMsg.content : 'Constituency block';

        grievances.push({
          id: ticketId,
          type,
          location,
          createdAt: msg.createdAt,
          status: msg.content.includes('electricity') || msg.content.includes('BWSSB') ? 'In Progress' : 'Pending',
        });
      }
    }

    res.json(grievances);
  } catch (error) {
    console.error('Error fetching grievances:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { phoneNumber, messageText, messageType } = req.body;
    if (!phoneNumber || !messageText) {
      return res.status(400).json({ error: 'phoneNumber and messageText are required' });
    }

    let org = await Organization.findOne();
    if (!org) {
      org = await Organization.create({ id: uuid(), name: 'Karnataka MLA Campaign Org' });
    }

    let contact = await Contact.findOne({ where: { organizationId: org.id, phoneNumber } });
    if (!contact) {
      contact = await Contact.create({
        id: uuid(),
        organizationId: org.id,
        phoneNumber,
        name: 'Citizen Chatbot User',
        conversationActive: true,
        customFields: { lastState: 'idle' }
      });
    }

    // Initialize customFields if empty
    if (!contact.customFields) {
      contact.customFields = { lastState: 'idle' };
    }

    const type = messageType || 'text';

    // Save incoming user message in DB
    const userMessage = await Message.create({
      id: uuid(),
      organizationId: org.id,
      contactId: contact.id,
      whatsappMessageId: `msg-in-${uuid()}`,
      messageType: type,
      content: type === 'image' ? `[Image Attachment: ${messageText}]` : messageText,
      direction: 'inbound',
      status: 'read',
      senderType: 'bot',
    });

    const workflow = getWorkflow();
    const cleanText = messageText.trim();
    const currentState = contact.customFields.lastState || 'idle';
    
    let replies = [];
    let nextState = 'idle';

    // Check if the user wants to escape back to the main menu
    const isEscape = ['menu', 'back', '1', '2', '3', '4', '5', '6', '7'].includes(cleanText.toLowerCase());

    // STATEFUL ROUTING ENGINE (Ignored if escape keyword is typed)
    if (currentState !== 'idle' && !isEscape) {
      const trackerId = `GR-${Math.floor(100000 + Math.random() * 900000)}`;

      if (currentState === 'AWAITING_STREETLIGHT_DETAILS') {
        const msg = await Message.create({
          id: uuid(),
          organizationId: org.id,
          contactId: contact.id,
          whatsappMessageId: `msg-out-${uuid()}`,
          messageType: 'text',
          content: `Thank you. A streetlight repair ticket has been logged for: '${cleanText}'. Your BBMP Grievance Tracker ID is: ${trackerId}. Ward Lighting Engineer Raghavan has been assigned. SLA: 48 hours.`,
          direction: 'outbound',
          status: 'delivered',
          senderType: 'bot',
        });
        replies.push(msg);

      } else if (currentState === 'AWAITING_POTHOLE_DETAILS') {
        const msg = await Message.create({
          id: uuid(),
          organizationId: org.id,
          contactId: contact.id,
          whatsappMessageId: `msg-out-${uuid()}`,
          messageType: 'text',
          content: `Thank you. Pothole repair complaint registered for location: '${cleanText}'. Your BBMP Tracker ID is: ${trackerId}. Assigned to asphalt contractors for filling. SLA: 48 hours.`,
          direction: 'outbound',
          status: 'delivered',
          senderType: 'bot',
        });
        replies.push(msg);

      } else if (currentState === 'AWAITING_GARBAGE_DETAILS') {
        const msg = await Message.create({
          id: uuid(),
          organizationId: org.id,
          contactId: contact.id,
          whatsappMessageId: `msg-out-${uuid()}`,
          messageType: 'text',
          content: `Garbage dump clearing ticket generated for location: '${cleanText}'. Your BBMP Tracker ID is: ${trackerId}. Ward garbage supervisor notified. Clearance vehicle dispatched. SLA: 12 hours.`,
          direction: 'outbound',
          status: 'delivered',
          senderType: 'bot',
        });
        replies.push(msg);

      } else if (currentState === 'AWAITING_WATER_LEAK_DETAILS') {
        const msg = await Message.create({
          id: uuid(),
          organizationId: org.id,
          contactId: contact.id,
          whatsappMessageId: `msg-out-${uuid()}`,
          messageType: 'text',
          content: `BWSSB Water pipe leak report logged at: '${cleanText}'. Your BWSSB Grievance Tracker ID is: ${trackerId}. Valve repair crew dispatched to prevent water waste. SLA: 8 hours.`,
          direction: 'outbound',
          status: 'delivered',
          senderType: 'bot',
        });
        replies.push(msg);

      } else if (currentState === 'AWAITING_TANKER_ID') {
        const tankerId = `TNK-${Math.floor(100000 + Math.random() * 900000)}`;
        const msg = await Message.create({
          id: uuid(),
          organizationId: org.id,
          contactId: contact.id,
          whatsappMessageId: `msg-out-${uuid()}`,
          messageType: 'text',
          content: `Subsidized Water Tanker booking confirmed for Connection ID/Location: '${cleanText}'. Your Tanker request ID is: ${tankerId}. Subsidized booking fee waived by Dr. Ramesh Gowda's desk. Dispatching in 3-4 hours.`,
          direction: 'outbound',
          status: 'delivered',
          senderType: 'bot',
        });
        replies.push(msg);

      } else if (currentState === 'AWAITING_SEWAGE_DETAILS') {
        const msg = await Message.create({
          id: uuid(),
          organizationId: org.id,
          contactId: contact.id,
          whatsappMessageId: `msg-out-${uuid()}`,
          messageType: 'text',
          content: `BWSSB Sewage blockage/overflow complaint registered for: '${cleanText}'. Your Tracker ID is: ${trackerId}. Sewage jetting machine scheduled to resolve the blockage. SLA: 4 hours.`,
          direction: 'outbound',
          status: 'delivered',
          senderType: 'bot',
        });
        replies.push(msg);

      } else if (currentState === 'AWAITING_GENERAL_COMPLAINT') {
        const msg = await Message.create({
          id: uuid(),
          organizationId: org.id,
          contactId: contact.id,
          whatsappMessageId: `msg-out-${uuid()}`,
          messageType: 'text',
          content: `Thank you. Your grievance has been directly logged: '${cleanText}'. Your Tracker ID is: ${trackerId}. Forwarded to the MLA desk coordinator. Dr. Ramesh Gowda's team will follow up in 24 hours.`,
          direction: 'outbound',
          status: 'delivered',
          senderType: 'bot',
        });
        replies.push(msg);
      }

    // IMAGE ATTACHMENT / COMPUTER VISION SIMULATION
    } else if (type === 'image') {
      const trackerId = `GR-${Math.floor(100000 + Math.random() * 900000)}`;
      let classification = 'Ward Grievance';
      let repairTeam = 'BBMP Ward Officer';
      let responseContent = '';

      if (cleanText.toLowerCase().includes('pothole')) {
        classification = 'Road Pothole (Severity: HIGH)';
        repairTeam = 'BBMP Asphalt Repair Team';
        responseContent = `📸 Image Attachment Received!\n\n🤖 BBMP AI vision classified: **${classification}**\n📍 Location extracted from metadata: Ward 4 constituency block\n📦 Grievance Tracker ID: ${trackerId}\n👨‍🔧 Status: ASSIGNED to ${repairTeam}. repair crew SLA: 48 hours.`;
      } else if (cleanText.toLowerCase().includes('streetlight') || cleanText.toLowerCase().includes('light')) {
        classification = 'Broken Streetlight / Lighting Failure';
        repairTeam = 'BBMP Lighting Division';
        responseContent = `📸 Image Attachment Received!\n\n🤖 BBMP AI vision classified: **${classification}**\n📍 Location extracted from metadata: Malleshwaram 4th Block\n📦 Grievance Tracker ID: ${trackerId}\n👨‍🔧 Status: ASSIGNED to ${repairTeam}. technician SLA: 24 hours.`;
      } else if (cleanText.toLowerCase().includes('garbage') || cleanText.toLowerCase().includes('waste')) {
        classification = 'Illegal Garbage dumping pile';
        repairTeam = 'BBMP Waste Management cell';
        responseContent = `📸 Image Attachment Received!\n\n🤖 BBMP AI vision classified: **${classification}**\n📍 Location extracted from metadata: Ward 4 block\n📦 Grievance Tracker ID: ${trackerId}\n👨‍🔧 Status: ASSIGNED to ${repairTeam} supervisor for clearance vehicle dispatch. SLA: 12 hours.`;
      } else {
        responseContent = `📸 Image Attachment Received!\n\n🤖 BBMP AI vision classified: **${classification}**\n📍 Location: constituency ward\n📦 Grievance Tracker ID: ${trackerId}\n👨‍🔧 Status: Logged and forwarded to ward desk supervisor. SLA: 24 hours.`;
      }

      const msg = await Message.create({
        id: uuid(),
        organizationId: org.id,
        contactId: contact.id,
        whatsappMessageId: `msg-out-${uuid()}`,
        messageType: 'text',
        content: responseContent,
        direction: 'outbound',
        status: 'delivered',
        senderType: 'bot',
      });
      replies.push(msg);

    // 10-digit Account Number logic (e.g. 1029384756)
    } else if (/^\d{10}$/.test(cleanText)) {
      const msg = await Message.create({
        id: uuid(),
        organizationId: org.id,
        contactId: contact.id,
        whatsappMessageId: `msg-out-${uuid()}`,
        messageType: 'text',
        content: `Thank you. Outage successfully reported for BESCOM Account ID ${cleanText}. ⚡ A utility crew has been dispatched to investigate. Current status: Dispatching crew. We will notify you once power is restored.`,
        direction: 'outbound',
        status: 'delivered',
        senderType: 'bot',
      });
      replies.push(msg);

    // 6-digit Grievance Status Check logic (e.g. GR-123456)
    } else if (/^GR-\d{6}$/i.test(cleanText)) {
      const msg = await Message.create({
        id: uuid(),
        organizationId: org.id,
        contactId: contact.id,
        whatsappMessageId: `msg-out-${uuid()}`,
        messageType: 'text',
        content: `Grievance status update for ticket [${cleanText.toUpperCase()}]:\n- Status: IN PROGRESS\n- Assigned to: Ward Coordinator Raghavan\n- Description: Streetlight repair & pothole patching\n- Estimated Resolution: Tomorrow, 5:00 PM.`,
        direction: 'outbound',
        status: 'delivered',
        senderType: 'bot',
      });
      replies.push(msg);

    // General GRIEVANCE text submission (manual override)
    } else if (cleanText.toUpperCase().startsWith('GRIEVANCE')) {
      const trackerId = `GR-${Math.floor(100000 + Math.random() * 900000)}`;
      const msg = await Message.create({
        id: uuid(),
        organizationId: org.id,
        contactId: contact.id,
        whatsappMessageId: `msg-out-${uuid()}`,
        messageType: 'text',
        content: `Thank you for detailing your grievance. 🙏 We have registered it and forwarded it directly to the ward coordinator desk. Your grievance tracker ID is: ${trackerId}. We resolve local BBMP & ward issues within 24-48 hours.`,
        direction: 'outbound',
        status: 'delivered',
        senderType: 'bot',
      });
      replies.push(msg);

    // Direct Options Lookup
    } else if (workflow.options[cleanText]) {
      const option = workflow.options[cleanText];
      
      const botMsg = await Message.create({
        id: uuid(),
        organizationId: org.id,
        contactId: contact.id,
        whatsappMessageId: `msg-out-${uuid()}`,
        messageType: 'text',
        content: option.reply,
        direction: 'outbound',
        status: 'delivered',
        senderType: 'bot',
      });
      replies.push(botMsg);

      // Conversational state transitions based on menu selection
      if (cleanText === '5.1') nextState = 'AWAITING_POTHOLE_DETAILS';
      else if (cleanText === '5.2') nextState = 'AWAITING_STREETLIGHT_DETAILS';
      else if (cleanText === '5.3') nextState = 'AWAITING_GARBAGE_DETAILS';
      else if (cleanText === '3.1') nextState = 'AWAITING_WATER_LEAK_DETAILS';
      else if (cleanText === '3.2') nextState = 'AWAITING_TANKER_ID';
      else if (cleanText === '3.3') nextState = 'AWAITING_SEWAGE_DETAILS';
      else if (cleanText === '7.1') nextState = 'AWAITING_GENERAL_COMPLAINT';

      // Special interactive logic: 2.3 simulates a ward agent joining the chat!
      if (cleanText === '2.3') {
        const joinMsg = await Message.create({
          id: uuid(),
          organizationId: org.id,
          contactId: contact.id,
          whatsappMessageId: `msg-sys-${uuid()}`,
          messageType: 'text',
          content: "🔔 Agent Ramesh from Malleshwaram ward coordination desk has joined the chat.",
          direction: 'outbound',
          status: 'read',
          senderType: 'system',
        });
        replies.push(joinMsg);

        const agentMsg = await Message.create({
          id: uuid(),
          organizationId: org.id,
          contactId: contact.id,
          whatsappMessageId: `msg-out-agent-${uuid()}`,
          messageType: 'text',
          content: "Namaskara! This is Ramesh. I see you are reporting a power fluctuation issue. Can you please confirm if this is affecting the entire street, or only your household?",
          direction: 'outbound',
          status: 'delivered',
          senderType: 'agent',
        });
        replies.push(agentMsg);
      }

    // Default Fallback
    } else {
      const msg = await Message.create({
        id: uuid(),
        organizationId: org.id,
        contactId: contact.id,
        whatsappMessageId: `msg-out-${uuid()}`,
        messageType: 'text',
        content: "Invalid option. ದಯವಿಟ್ಟು 1 ರಿಂದ 7 ರವರೆಗಿನ ಸಂಖ್ಯೆಯನ್ನು ಒತ್ತಿರಿ. \n\nPlease reply with a valid option code (e.g. 1, 1.1, 2, 2.1) or describe your complaint starting with the word 'GRIEVANCE'.",
        direction: 'outbound',
        status: 'delivered',
        senderType: 'bot',
      });
      replies.push(msg);
    }

    // Persist next state
    await contact.update({
      lastMessageAt: new Date(),
      customFields: { ...contact.customFields, lastState: nextState }
    });

    res.json({
      success: true,
      userMessage,
      botMessage: replies[0],
      replies
    });
  } catch (error) {
    console.error('Error handling chat bot reply:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
