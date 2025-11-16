import { Box, Paper, Typography, IconButton, Tooltip } from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import { Item } from "@/src/services/item.service";
import Image from "next/image";
import { formatMoney } from "@/src/utils/formatMoney";

type Props = {
  rows: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
};

export default function ItemsMobileList({ rows, onEdit, onDelete }: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {rows.map((item) => (
        <Paper key={item.itemID} sx={{ p: 2, border: "1px solid #eaeaea" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Box>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 1,
                  bgcolor: "#f5f5f5",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #e0e0e0",
                }}
              >
                {item?.itemPicture ? (
                  <Image
                    src={item?.itemPicture}
                    alt={item.itemName}
                    fill
                    style={{
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <ImageIcon sx={{ color: "#9e9e9e" }} />
                )}
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>{item.itemName}</Typography>

              <Tooltip title={item.description}>
                <Typography sx={{ color: "#424242", maxWidth: "100%" }}>
                  {item.description}
                </Typography>
              </Tooltip>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 1,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>
                    {formatMoney(item.salesRate)}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ color: "#262626" }}>
                    {item.discountPct.toFixed(2)}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                <IconButton
                  size="small"
                  aria-label="edit"
                  onClick={() => onEdit(item)}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="delete"
                  onClick={() => onDelete(item)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
