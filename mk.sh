set -e
C=$OCI_TENANCY
echo "① 네트워크 만드는 중..."
VCN=$(oci network vcn list -c $C --display-name msr-vcn --query 'data[0].id' --raw-output 2>/dev/null || true)
if [ -z "$VCN" ] || [ "$VCN" = "None" ]; then
VCN=$(oci network vcn create -c $C --cidr-block 10.0.0.0/16 --display-name msr-vcn --dns-label msrvcn --wait-for-state AVAILABLE --query 'data.id' --raw-output)
IGW=$(oci network internet-gateway create -c $C --vcn-id $VCN --is-enabled true --display-name msr-igw --wait-for-state AVAILABLE --query 'data.id' --raw-output)
RT=$(oci network vcn get --vcn-id $VCN --query 'data."default-route-table-id"' --raw-output)
oci network route-table update --rt-id $RT --force --route-rules "[{\"destination\":\"0.0.0.0/0\",\"destinationType\":\"CIDR_BLOCK\",\"networkEntityId\":\"$IGW\"}]" >/dev/null
SL=$(oci network vcn get --vcn-id $VCN --query 'data."default-security-list-id"' --raw-output)
oci network security-list update --security-list-id $SL --force --ingress-security-rules '[{"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"min":22,"max":22}}},{"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"min":80,"max":80}}},{"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"min":443,"max":443}}}]' >/dev/null
oci network subnet create -c $C --vcn-id $VCN --cidr-block 10.0.0.0/24 --display-name msr-sub --dns-label msrsub --wait-for-state AVAILABLE >/dev/null
fi
SUB=$(oci network subnet list -c $C --vcn-id $VCN --query 'data[0].id' --raw-output)
echo "② 우분투 24.04 이미지 찾는 중..."
IMG=$(oci compute image list -c $C --operating-system "Canonical Ubuntu" --operating-system-version "24.04" --shape VM.Standard.A1.Flex --sort-by TIMECREATED --query 'data[0].id' --raw-output)
[ -f ~/.ssh/id_rsa ] || ssh-keygen -t rsa -b 4096 -N "" -f ~/.ssh/id_rsa -q
ID=$(oci compute instance list -c $C --display-name msr --lifecycle-state RUNNING --query 'data[0].id' --raw-output 2>/dev/null || true)
if [ -z "$ID" ] || [ "$ID" = "None" ]; then
echo "③ 서버 만드는 중 (2~5분)..."
ID=""
for AD in $(oci iam availability-domain list -c $C --query 'data[].name' --raw-output | tr -d '[]",'); do
  ID=$(oci compute instance launch -c $C --availability-domain "$AD" --shape VM.Standard.A1.Flex --shape-config '{"ocpus":2,"memoryInGBs":12}' --display-name msr --image-id $IMG --subnet-id $SUB --assign-public-ip true --ssh-authorized-keys-file ~/.ssh/id_rsa.pub --boot-volume-size-in-gbs 50 --wait-for-state RUNNING --query 'data.id' --raw-output 2>/tmp/err.txt) && break || { echo "  $AD 실패:"; grep -o '"message": "[^"]*"' /tmp/err.txt | head -1; ID=""; }
done
fi
[ -n "$ID" ] || { echo "❌ 서버를 못 만듦 — 위 실패 메시지를 캡처해 주세요"; exit 1; }
IP=$(oci compute instance list-vnics --instance-id $ID --query 'data[0]."public-ip"' --raw-output)
echo "$IP" > ~/msr_ip.txt
echo "✅ 완료! 서버 주소: $IP"
