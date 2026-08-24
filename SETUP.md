# Wavely - Setup & Configuration Guide

This guide walks you through setting up the Wavely platform locally and on Hostinger Kubernetes.

## 📋 Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Docker Compose Setup](#docker-compose-setup)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Environment Configuration](#environment-configuration)
5. [API Integration](#api-integration)
6. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Step 1: Prerequisites

Ensure you have installed:
- Node.js 18+ ([download](https://nodejs.org/))
- PostgreSQL 15 ([download](https://www.postgresql.org/))
- Redis 7 ([download](https://redis.io/))
- Git

### Step 2: Clone Repository

```bash
cd ~/Official/Projects_NDS/NDSProducts/
git clone <your-repo-url> Wavely
cd Wavely
```

### Step 3: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..

# Install frontend dependencies
cd client && npm install && cd ..
```

### Step 4: Configure Environment

**Backend (.env)**
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wavely
DB_USER=postgres
DB_PASSWORD=your_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-here
WHATSAPP_BUSINESS_ID=your-business-id
WHATSAPP_PHONE_ID=your-phone-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_WEBHOOK_TOKEN=your-webhook-token
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

**Frontend (.env)**
```bash
cp client/.env.example client/.env
```

Edit `client/.env`:
```
VITE_API_URL=http://localhost:5000
```

### Step 5: Database Setup

```bash
# Create database
createdb wavely -U postgres

# Start backend (migrations will run automatically)
cd server && npm run dev
```

### Step 6: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# App runs on http://localhost:3000
```

### Step 7: Verify Setup

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

---

## Docker Compose Setup

### Quick Start

```bash
# Build and start all services
docker-compose up --build

# In another terminal, initialize database
docker-compose exec server npm run migrations
```

### Services

Access your services:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### Useful Commands

```bash
# View logs
docker-compose logs -f server
docker-compose logs -f client

# Stop services
docker-compose down

# Remove volumes (warning: deletes data)
docker-compose down -v

# Rebuild specific service
docker-compose build server
docker-compose up server
```

---

## Kubernetes Deployment

### Prerequisites

- Hostinger Kubernetes cluster
- `kubectl` CLI installed
- Docker images pushed to registry

### Step 1: Prepare Docker Images

```bash
# Build images
docker build -t your-registry/wavely-server:1.0.0 -f server/Dockerfile .
docker build -t your-registry/wavely-client:1.0.0 -f client/Dockerfile .

# Push to registry
docker push your-registry/wavely-server:1.0.0
docker push your-registry/wavely-client:1.0.0
```

### Step 2: Get Kubeconfig

1. Login to Hostinger control panel
2. Navigate to Kubernetes section
3. Download kubeconfig file
4. Save to `~/.kube/config` or specific path

### Step 3: Verify Connection

```bash
kubectl cluster-info
kubectl get nodes
```

### Step 4: Update Image References

Edit `k8s/03-server.yaml` and `k8s/04-client.yaml`:
```yaml
image: your-registry/wavely-server:1.0.0  # Update this
image: your-registry/wavely-client:1.0.0  # Update this
```

### Step 5: Update Secrets

Edit `k8s/00-namespace.yaml` and replace all placeholder values:

```bash
# View example
cat k8s/00-namespace.yaml

# Edit with your actual credentials
kubectl apply -f k8s/00-namespace.yaml
```

### Step 6: Deploy Stack

```bash
# Deploy in order
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-postgres.yaml
kubectl apply -f k8s/02-redis.yaml
kubectl apply -f k8s/03-server.yaml
kubectl apply -f k8s/04-client.yaml
kubectl apply -f k8s/05-ingress.yaml

# Monitor deployment
kubectl get pods -n wavely -w
```

### Step 7: Configure Ingress

Edit `k8s/05-ingress.yaml`:
```yaml
- host: your-domain.com      # Update
- host: api.your-domain.com  # Update
```

Then apply:
```bash
kubectl apply -f k8s/05-ingress.yaml
```

### Step 8: Get Access URL

```bash
# Get LoadBalancer IP or Hostname
kubectl get svc client-service -n wavely

# Or via Ingress
kubectl get ingress -n wavely
```

---

## Environment Configuration

### Required API Keys

#### WhatsApp Business API

1. Go to [Meta Business Platform](https://business.facebook.com/)
2. Create/select business
3. Create WhatsApp Business App
4. Get credentials:
   - Business Account ID
   - Phone Number ID
   - Access Token
   - Webhook Verify Token

#### Razorpay

1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get API Keys (Key ID & Key Secret)
3. Add in environment variables

#### OAuth (Optional)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add credentials to `.env`

**GitHub OAuth:**
1. Go to GitHub Settings → Developer Settings
2. Create OAuth App
3. Get Client ID & Secret
4. Add to `.env`

---

## API Integration

### WhatsApp Webhook Setup

1. **Get Your Webhook URL:**
   ```
   https://your-domain.com/api/whatsapp/webhook
   ```

2. **In Meta Dashboard:**
   - Go to App Settings → Webhooks
   - Set Callback URL to your webhook
   - Set Verify Token (match `WHATSAPP_WEBHOOK_TOKEN`)
   - Subscribe to `messages` object

3. **Test Webhook:**
   ```bash
   curl -X GET "http://localhost:5000/api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=test&hub.verify_token=your-token"
   ```

### Message Flow

```
User sends WhatsApp message
        ↓
Meta API sends to your webhook
        ↓
/api/whatsapp/webhook receives
        ↓
Parse & store in database
        ↓
Route to agent or chatbot
        ↓
Send response via WhatsApp API
```

---

## Scaling & Performance

### Horizontal Scaling

```bash
# Scale backend
kubectl scale deployment server --replicas=5 -n wavely

# Scale frontend
kubectl scale deployment client --replicas=3 -n wavely
```

### Auto-scaling (HPA)

Already configured in `k8s/03-server.yaml`:
- Min replicas: 2
- Max replicas: 5
- Target CPU: 70%

### Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_contacts_org_phone 
  ON contacts(organization_id, phone_number);

CREATE INDEX idx_messages_contact 
  ON messages(organization_id, contact_id);

CREATE INDEX idx_campaigns_status 
  ON campaigns(organization_id, status);
```

---

## Monitoring & Logs

### Kubernetes Logs

```bash
# View server logs
kubectl logs -f deployment/server -n wavely

# View client logs
kubectl logs -f deployment/client -n wavely

# View all events
kubectl get events -n wavely --sort-by='.lastTimestamp'
```

### Database Monitoring

```bash
# Connect to PostgreSQL
kubectl exec -it postgres-0 -n wavely -- psql -U postgres

# Check connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
```

### Redis Monitoring

```bash
# Connect to Redis
kubectl exec -it redis-0 -n wavely -- redis-cli

# Check memory
INFO memory

# Check keyspace
DBSIZE
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check PostgreSQL
psql -h localhost -U postgres -d wavely

# If using Docker
docker-compose exec postgres psql -U postgres
```

### Redis Connection Failed

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Check Redis is running
brew services list | grep redis  # macOS
systemctl status redis-server     # Linux
```

### Kubernetes Pod CrashLoopBackOff

```bash
# Check logs
kubectl logs -f <pod-name> -n wavely

# Describe pod for events
kubectl describe pod <pod-name> -n wavely

# Check resource limits
kubectl top pods -n wavely
```

### CORS Issues

Update `server/src/index.js`:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
```

### Image Pull Errors

```bash
# Check image exists in registry
docker pull your-registry/wavely-server:1.0.0

# Update image pull policy if using local images
# Change imagePullPolicy: IfNotPresent in k8s manifests
```

### Webhook Not Receiving Messages

1. Verify webhook is publicly accessible
2. Check `WHATSAPP_WEBHOOK_TOKEN` matches Meta settings
3. Ensure WhatsApp API credentials are valid
4. Check server logs for errors

---

## Production Checklist

- [ ] Update all hardcoded secrets to environment variables
- [ ] Enable HTTPS on ingress
- [ ] Configure proper CORS
- [ ] Set up SSL certificates
- [ ] Configure backup for PostgreSQL
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation (ELK Stack)
- [ ] Set up CI/CD pipeline
- [ ] Test disaster recovery
- [ ] Document runbooks
- [ ] Set up alerting
- [ ] Configure rate limiting
- [ ] Enable database encryption
- [ ] Set up VPN for admin access

---

## Support & Resources

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Razorpay Integration Guide](https://razorpay.com/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Hostinger Support](https://support.hostinger.com/)

---

**Last Updated:** May 11, 2026
